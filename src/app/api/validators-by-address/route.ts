import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { APIValidatorInfo } from '../../../types/api';
import { BeaconChainResponse } from '../../../types/beacon';
import { beaconToAPIValidatorInfo } from '../../../utils/apiConverters';
import { NETWORK_CONFIG } from '../../../constants/networks';
import { env } from '../../../env';

const CHIADO_VALIDATORS_API_URL = env.CHIADO_VALIDATORS_API_URL;
const CHIADO_VALIDATORS_API_KEY = env.CHIADO_VALIDATORS_API_KEY;
const GNOSIS_VALIDATORS_API_URL = env.GNOSIS_VALIDATORS_API_URL;
const GNOSIS_VALIDATORS_API_KEY = env.GNOSIS_VALIDATORS_API_KEY;

// The indexer accepts `limit` up to 10000. Pages are fetched until a short one.
const INDEXER_PAGE_SIZE = 500;
// Hard stop so a misbehaving indexer cannot keep us looping.
const INDEXER_MAX_PAGES = 50;

// Pubkeys per beacon request (bounded by URL length) and requests in flight at once.
const BEACON_BATCH_SIZE = 50;
const BEACON_MAX_CONCURRENCY = 5;

interface IndexerRecord {
	validator_index: number;
	pubkey: string;
	withdrawal_address: string;
}

// The deployed indexer returns a bare array; the electra-queue-index branch
// wraps it as `{ validators, queued_deposits, ... }`. Accept both.
type IndexerResponse = IndexerRecord[] | { validators?: IndexerRecord[] | null } | null;

function indexerRecords(json: IndexerResponse): IndexerRecord[] {
	if (Array.isArray(json)) return json;
	return json?.validators ?? [];
}

async function fetchIndexerPage(
	withdrawal_address: string,
	chainId: number,
	offset: number,
): Promise<IndexerRecord[]> {
	const isChiado = chainId === 10200;
	const res = await fetch(isChiado ? CHIADO_VALIDATORS_API_URL : GNOSIS_VALIDATORS_API_URL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'X-API-Key': isChiado ? CHIADO_VALIDATORS_API_KEY : GNOSIS_VALIDATORS_API_KEY,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ withdrawal_address, limit: INDEXER_PAGE_SIZE, offset }),
		signal: AbortSignal.timeout(5_000),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Validators indexer error: ${err}`);
	}

	return indexerRecords(await res.json());
}

// Every pubkey the indexer holds for the address, across as many pages as needed.
async function fetchPubkeysByCredential(
	withdrawal_address: string,
	chainId: number,
): Promise<string[]> {
	// A Set: an index refresh between two page requests could otherwise repeat
	// a record at the page boundary.
	const pubkeys = new Set<string>();

	for (let page = 0; page < INDEXER_MAX_PAGES; page++) {
		const records = await fetchIndexerPage(withdrawal_address, chainId, page * INDEXER_PAGE_SIZE);
		for (const r of records) pubkeys.add(r.pubkey);
		if (records.length < INDEXER_PAGE_SIZE) break;
	}

	return [...pubkeys];
}

async function fetchBeaconBatch(
	pubkeys: string[],
	clEndpoint: string,
): Promise<BeaconChainResponse[]> {
	const url = new URL('/eth/v1/beacon/states/head/validators', clEndpoint);
	url.searchParams.set('id', pubkeys.join(','));
	if (url.origin !== new URL(clEndpoint).origin) return [];

	const res = await fetch(url, {
		headers: { Accept: 'application/json' },
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error(`Beacon API error: ${res.status}`);

	const json = await res.json();
	return (json?.data ?? []) as BeaconChainResponse[];
}

async function fetchBeaconValidators(
	pubkeys: string[],
	clEndpoint: string,
): Promise<BeaconChainResponse[]> {
	const batches: string[][] = [];
	for (let i = 0; i < pubkeys.length; i += BEACON_BATCH_SIZE) {
		batches.push(pubkeys.slice(i, i + BEACON_BATCH_SIZE));
	}

	// Bounded concurrency: an address with thousands of validators must not fire
	// hundreds of requests at the beacon node at once.
	const results: BeaconChainResponse[] = [];
	for (let i = 0; i < batches.length; i += BEACON_MAX_CONCURRENCY) {
		const group = batches.slice(i, i + BEACON_MAX_CONCURRENCY);
		const settled = await Promise.all(group.map((b) => fetchBeaconBatch(b, clEndpoint)));
		results.push(...settled.flat());
	}
	return results;
}

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const address = searchParams.get('address');
		const chainId = searchParams.get('chainId');

		if (!address)
			return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
		if (!chainId)
			return NextResponse.json({ error: 'chainId parameter is required' }, { status: 400 });

		if (chainId !== '10200' && chainId !== '100')
			return NextResponse.json({ error: 'Unsupported chainId' }, { status: 400 });

		const networkConfig = NETWORK_CONFIG[Number(chainId)];
		if (!networkConfig) return NextResponse.json({ error: 'Unsupported chainId' }, { status: 400 });
		if (!isAddress(address))
			return NextResponse.json({ error: 'Invalid address' }, { status: 400 });

		// Step 1: get pubkeys from the indexer (credential mapping only)
		const pubkeys = await fetchPubkeysByCredential(address, Number(chainId));

		if (pubkeys.length === 0) return NextResponse.json({ data: [] });

		// Step 2: get real-time balance/status from beacon API
		const beaconValidators = await fetchBeaconValidators(pubkeys, networkConfig.clEndpoint);

		const validators: APIValidatorInfo[] = beaconValidators.map((v) =>
			beaconToAPIValidatorInfo(v, networkConfig.cl.multiplier),
		);

		return NextResponse.json({ data: validators });
	} catch (error) {
		if (error instanceof DOMException && error.name === 'TimeoutError') {
			return NextResponse.json({ error: 'Upstream timed out' }, { status: 504 });
		}
		console.error('Error fetching validators:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
