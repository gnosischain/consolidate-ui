import { NextRequest, NextResponse } from 'next/server';
import { Address, parseGwei } from 'viem';
import { BeaconChainResponse } from '../../../types/beacon';
import { APIValidatorInfo } from '../../../types/api';
import { STATUS_TO_FILTER } from '../../../utils/status';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const clEndpoint = searchParams.get('clEndpoint');
    const clMultiplier = searchParams.get('clMultiplier') || '1';

    if (!address) {
      return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
    }

    if (!clEndpoint) {
      return NextResponse.json({ error: 'clEndpoint parameter is required' }, { status: 400 });
    }

    // Normalize the address: remove 0x prefix and lowercase
    const addrHex = address.toLowerCase().replace(/^0x/, '');

    const res = await fetch(
      clEndpoint + '/eth/v1/beacon/states/finalized/validators',
    );
    
    if (!res.ok) {
      return NextResponse.json(
        { error: `HTTP ${res.status} - ${res.statusText}` },
        { status: res.status }
      );
    }

    const json = await res.json();
    const data: BeaconChainResponse[] = json.data;
    const multiplier = BigInt(clMultiplier);

    const filtered: APIValidatorInfo[] = data
      .filter((v: { validator: { withdrawal_credentials: string }; index: number }) => {
        const creds: string = v.validator.withdrawal_credentials;
        return (
          (creds.startsWith('0x01') || creds.startsWith('0x02')) && creds.endsWith(addrHex)
        );
      })
      .map((v) => {
        const creds = v.validator.withdrawal_credentials;
        const address = `0x${creds.slice(-40)}` as Address;
        const filterStatus = STATUS_TO_FILTER[v.status];
        
        return {
          index: Number(v.index),
          pubkey: v.validator.pubkey,
          balanceEth: (parseGwei(v.validator.effective_balance.toString()) / multiplier).toString(),
          withdrawal_credentials: address,
          type: creds.startsWith('0x02') ? 2 : creds.startsWith('0x01') ? 1 : 0,
          filterStatus: filterStatus,
          status: v.status,
        };
      });

    return NextResponse.json({ data: filtered });
  } catch (error) {
    console.error('Error fetching beacon states:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 