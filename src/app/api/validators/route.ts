import { NextRequest, NextResponse } from 'next/server';
import { BeaconApiValidatorsResponse } from '../../../types/beaconApi';
import { NETWORK_CONFIG } from '../../../constants/networks';

const LIMIT = 200;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const offset = parseInt(searchParams.get('offset') || '0');
    const chainId = searchParams.get('chainId');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    if (!chainId) {
      return NextResponse.json({ error: 'chainId parameter is required' }, { status: 400 });
    }

    const networkConfig = NETWORK_CONFIG[Number(chainId)];
    if (!networkConfig) {
      return NextResponse.json({ error: 'Unsupported chainId' }, { status: 400 });
    }

    if (!networkConfig.beaconchainApi) {
      return NextResponse.json({ error: 'BeaconchainApi not configured for this network' }, { status: 400 });
    }

    const beaconchainApiUrl = networkConfig.beaconchainApi;
    const apiKey = process.env.BEACONCHAIN_API_KEY;
    
    const url = new URL(`/api/v1/validator/withdrawalCredentials/${address}`, beaconchainApiUrl);
    url.searchParams.set('limit', String(LIMIT));
    url.searchParams.set('offset', String(offset));

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['apikey'] = apiKey;
    }

    const resp = await fetch(url.toString(), { headers });
    
    if (!resp.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from beacon chain API: ${resp.status} ${resp.statusText}` },
        { status: resp.status }
      );
    }

    const body: {
      data: BeaconApiValidatorsResponse[] | BeaconApiValidatorsResponse;
    } = await resp.json();

    const rows = Array.isArray(body.data) ? body.data : [body.data];

    const validators = rows.map((d) => ({
      publickey: d.publickey,
      index: d.validatorindex,
    }));

    return NextResponse.json({ data: validators });
  } catch (error) {
    console.error('Error fetching validators:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 