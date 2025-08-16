import { NextRequest, NextResponse } from 'next/server';
import { Address, parseGwei } from 'viem';
import { APIValidatorInfo } from '../../../types/api';
import { BeaconApiValidatorDetailsResponse } from '../../../types/beaconApi';
import { STATUS_TO_FILTER } from '../../../utils/status';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pubkeys = searchParams.get('pubkeys');
    const beaconchainApiUrl = searchParams.get('beaconchainApiUrl');
    const clMultiplier = searchParams.get('clMultiplier') || '1';

    if (!pubkeys) {
      return NextResponse.json({ error: 'Pubkeys parameter is required' }, { status: 400 });
    }

    if (!beaconchainApiUrl) {
      return NextResponse.json({ error: 'BeaconchainApiUrl parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.BEACONCHAIN_API_KEY;
    
    const url = `${beaconchainApiUrl}/api/v1/validator/${pubkeys}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['apikey'] = apiKey;
    }

    const resp = await fetch(url, { headers });
    
    if (!resp.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from beacon chain API: ${resp.status} ${resp.statusText}` },
        { status: resp.status }
      );
    }

    const body: {
      data: BeaconApiValidatorDetailsResponse[] | BeaconApiValidatorDetailsResponse;
    } = await resp.json();

    const rows = Array.isArray(body.data) ? body.data : [body.data];
    const multiplier = BigInt(clMultiplier);

    const validators: APIValidatorInfo[] = rows.map(d => {
      const creds = d.withdrawalcredentials;
      //TODO : verify it not break the fetch of validators
      // const address = `0x${creds.slice(-40)}` as Address;
      const filterStatus = STATUS_TO_FILTER[d.status];

      return {
        index: d.validatorindex,
        pubkey: d.pubkey as Address,
        balanceEth: (parseGwei(d.balance.toString()) / multiplier).toString(),
        withdrawal_credentials: d.withdrawalcredentials,
        type: creds.startsWith('0x02') ? 2 : 1,
        filterStatus: filterStatus,
        status: d.status,
      };
    });

    return NextResponse.json({ data: validators });
  } catch (error) {
    console.error('Error fetching validator details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 