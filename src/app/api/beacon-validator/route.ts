import { NextRequest, NextResponse } from 'next/server';
import { APIValidatorInfo } from '../../../types/api';
import { BeaconChainResponse } from '../../../types/beacon';
import { beaconToAPIValidatorInfo } from '../../../utils/apiConverters';
import { NETWORK_CONFIG } from '../../../constants/networks';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const pubkeys = searchParams.get('pubkeys');
		const chainId = searchParams.get('chainId');

		if (!pubkeys) {
			return NextResponse.json({ error: 'Pubkeys parameter is required' }, { status: 400 });
		}

		const pubkeyList = pubkeys
			.split(',')
			.map((p) => p.trim())
			.filter(Boolean);

		if (pubkeyList.length > 200) {
			return NextResponse.json({ error: 'Pubkeys must be less than 200' }, { status: 400 });
		}

		if (!chainId) {
			return NextResponse.json({ error: 'chainId parameter is required' }, { status: 400 });
		}

		const networkConfig = NETWORK_CONFIG[Number(chainId)];
		if (!networkConfig) {
			return NextResponse.json({ error: 'Unsupported chainId' }, { status: 400 });
		}

		const clEndpoint = networkConfig.clEndpoint;
		const PUBKEY_REGEX = /^0x[0-9a-fA-F]{96}$/;

		if (!pubkeyList.every((p) => PUBKEY_REGEX.test(p))) {
			return NextResponse.json({ error: 'One or more pubkeys are invalid' }, { status: 400 });
		}

		const allowedOrigin = new URL(clEndpoint).origin;
		const BATCH_SIZE = 50;
		const fetchPromises = [];

		for (let i = 0; i < pubkeyList.length; i += BATCH_SIZE) {
			const chunk = pubkeyList.slice(i, i + BATCH_SIZE);
			const url = new URL('/eth/v1/beacon/states/finalized/validators', clEndpoint);

			url.searchParams.set('id', chunk.join(','));

			if (url.origin === allowedOrigin) {
				fetchPromises.push(
					fetch(url).then((res) => {
						if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
						return res.json();
					}),
				);
			}
		}

		const results = await Promise.all(fetchPromises);
		const validators: APIValidatorInfo[] = [];

		for (const json of results) {
			if (!json || !json.data) continue;

			for (const v of json.data as BeaconChainResponse[]) {
				validators.push(beaconToAPIValidatorInfo(v, networkConfig.cl.multiplier));
			}
		}

		return NextResponse.json({ data: validators });
	} catch (error) {
		console.error('Error fetching beacon validators:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
