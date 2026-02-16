import { NextRequest, NextResponse } from 'next/server';
import { Address, parseGwei } from 'viem';
import { APIValidatorInfo } from '../../../types/api';
import { BeaconApiValidatorDetailsResponse } from '../../../types/beaconApi';
import { STATUS_TO_FILTER } from '../../../utils/status';
import { NETWORK_CONFIG } from '../../../constants/networks';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pubkeys = searchParams.get('pubkeys');
    const chainId = searchParams.get('chainId');

    if (!pubkeys) {
      return NextResponse.json({ error: 'Pubkeys parameter is required' }, { status: 400 });
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
    const multiplier = networkConfig.cl.multiplier;
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

    const validators: APIValidatorInfo[] = rows.map(d => {
      const creds = d.withdrawalcredentials;
      //TODO : verify it not break the fetch of validators
      // const address = `0x${creds.slice(-40)}` as Address;
      const filterStatus = STATUS_TO_FILTER[d.status];

      return {
        index: d.validatorindex,
        pubkey: d.pubkey as Address,
        balance: (parseGwei(d.balance.toString()) / multiplier).toString(),
        effectiveBalance: (parseGwei(d.effectivebalance.toString()) / multiplier).toString(),
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