import { NextRequest, NextResponse } from 'next/server';
import { Address, isAddress, parseGwei } from 'viem';
import { APIValidatorInfo } from '../../../types/api';
import { BeaconChainResponse } from '../../../types/beacon';
import { STATUS_TO_FILTER } from '../../../utils/status';
import { NETWORK_CONFIG } from '../../../constants/networks';

const CHIADO_VALIDATORS_API_URL = process.env.CHIADO_VALIDATORS_API_URL!;
const CHIADO_VALIDATORS_API_KEY = process.env.CHIADO_VALIDATORS_API_KEY!;
const GNOSIS_VALIDATORS_API_URL = process.env.GNOSIS_VALIDATORS_API_URL!;
const GNOSIS_VALIDATORS_API_KEY = process.env.GNOSIS_VALIDATORS_API_KEY!;

const BEACON_BATCH_SIZE = 50;

interface IndexerRecord {
	validator_index: number;
	pubkey: string;
	withdrawal_address: string;
}

async function fetchPubkeysByCredential(
	withdrawal_address: string,
	chainId: number,
): Promise<IndexerRecord[]> {
	console.log(chainId === 10200 ? CHIADO_VALIDATORS_API_URL : GNOSIS_VALIDATORS_API_URL);
	const res = await fetch(
		chainId === 10200 ? CHIADO_VALIDATORS_API_URL : GNOSIS_VALIDATORS_API_URL,
		{
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'X-API-Key': chainId === 10200 ? CHIADO_VALIDATORS_API_KEY : GNOSIS_VALIDATORS_API_KEY,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ withdrawal_address, limit: 500, offset: 0 }),
		},
	);

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Validators indexer error: ${err}`);
	}

	return res.json();
}

async function fetchBeaconValidators(
	pubkeys: string[],
	clEndpoint: string,
): Promise<BeaconChainResponse[]> {
	const batches: Promise<BeaconChainResponse[]>[] = [];
	const allowedOrigin = new URL(clEndpoint).origin;

	for (let i = 0; i < pubkeys.length; i += BEACON_BATCH_SIZE) {
		const chunk = pubkeys.slice(i, i + BEACON_BATCH_SIZE);
		const url = new URL('/eth/v1/beacon/states/head/validators', clEndpoint);
		url.searchParams.set('id', chunk.join(','));

		if (url.origin !== allowedOrigin) continue;

		batches.push(
			fetch(url, { headers: { Accept: 'application/json' } })
				.then((r) => {
					if (!r.ok) throw new Error(`Beacon API error: ${r.status}`);
					return r.json();
				})
				.then((json) => (json?.data ?? []) as BeaconChainResponse[]),
		);
	}

	const results = await Promise.all(batches);
	return results.flat();
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
		const records = await fetchPubkeysByCredential(address, Number(chainId));

		if (records.length === 0) return NextResponse.json({ data: [] });

		const pubkeys = records.map((r) => r.pubkey);

		// Step 2: get real-time balance/status from beacon API
		const beaconValidators = await fetchBeaconValidators(pubkeys, networkConfig.clEndpoint);

		const multiplier = networkConfig.cl.multiplier;

		const validators: APIValidatorInfo[] = beaconValidators.map((v) => {
			const creds = v.validator.withdrawal_credentials;
			return {
				index: Number(v.index),
				pubkey: v.validator.pubkey as Address,
				balance: (parseGwei(v.balance.toString()) / multiplier).toString(),
				effectiveBalance: (
					parseGwei(v.validator.effective_balance.toString()) / multiplier
				).toString(),
				withdrawal_credentials: creds,
				type: creds.startsWith('0x02') ? 2 : creds.startsWith('0x01') ? 1 : 0,
				filterStatus: STATUS_TO_FILTER[v.status],
				status: v.status,
			};
		});

		return NextResponse.json({ data: validators });
	} catch (error) {
		console.error('Error fetching validators:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
