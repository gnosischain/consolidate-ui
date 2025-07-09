import { NextRequest, NextResponse } from 'next/server';
import { BeaconApiValidatorsResponse } from '../../../types/beaconApi';

const LIMIT = 200;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const offset = parseInt(searchParams.get('offset') || '0');
    const beaconchainApiUrl = searchParams.get('beaconchainApiUrl');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    if (!beaconchainApiUrl) {
      return NextResponse.json({ error: 'BeaconchainApiUrl parameter is required' }, { status: 400 });
    }

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