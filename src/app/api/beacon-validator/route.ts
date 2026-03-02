import { NextRequest, NextResponse } from 'next/server';
import { Address, parseGwei } from 'viem';
import { APIValidatorInfo } from '../../../types/api';
import { BeaconChainResponse } from '../../../types/beacon';
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

    if (pubkeys.split(',').length > 1000) {
      return NextResponse.json({ error: 'Pubkeys must be less than 1000' }, { status: 400 });
    }

    if (!chainId) {
      return NextResponse.json({ error: 'chainId parameter is required' }, { status: 400 });
    }

    const networkConfig = NETWORK_CONFIG[Number(chainId)];
    if (!networkConfig) {
      return NextResponse.json({ error: 'Unsupported chainId' }, { status: 400 });
    }

    const clEndpoint = networkConfig.clEndpoint;
    const multiplier = networkConfig.cl.multiplier;
    const PUBKEY_REGEX = /^0x[0-9a-fA-F]{96}$/;
    const pubkeyList = pubkeys.split(',').map(p => p.trim()).filter(Boolean);
    if (!pubkeyList.every(p => PUBKEY_REGEX.test(p))) {
      return NextResponse.json({ error: 'One or more pubkeys are invalid' }, { status: 400 });
    }
    const validators: APIValidatorInfo[] = [];

    for (const pubkey of pubkeyList) {
      try {
        const url = `${clEndpoint}/eth/v1/beacon/states/finalized/validators/${pubkey}`;
        const resp = await fetch(url);

        if (!resp.ok) {
          console.warn(`Failed to fetch validator ${pubkey}: ${resp.status}`);
          continue;
        }

        const json: { data: BeaconChainResponse } = await resp.json();
        const v = json.data;
        const creds = v.validator.withdrawal_credentials;
        const filterStatus = STATUS_TO_FILTER[v.status];

        validators.push({
          index: Number(v.index),
          pubkey: v.validator.pubkey as Address,
          balance: (parseGwei(v.balance.toString()) / multiplier).toString(),
          effectiveBalance: (parseGwei(v.validator.effective_balance.toString()) / multiplier).toString(),
          withdrawal_credentials: v.validator.withdrawal_credentials,
          type: creds.startsWith('0x02') ? 2 : creds.startsWith('0x01') ? 1 : 0,
          filterStatus: filterStatus,
          status: v.status,
        });
      } catch (err) {
        console.warn('Error fetching validator', pubkey, err);
      }
    }

    return NextResponse.json({ data: validators });
  } catch (error) {
    console.error('Error fetching beacon validators:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
