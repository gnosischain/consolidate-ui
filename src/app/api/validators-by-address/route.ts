import { NextRequest, NextResponse } from 'next/server';
import { Address, isAddress, parseGwei } from 'viem';
import { APIValidatorInfo } from '../../../types/api';
import { BeaconChainResponse } from '../../../types/beacon';
import { STATUS_TO_FILTER } from '../../../utils/status';
import { NETWORK_CONFIG } from '../../../constants/networks';
import { fetchGraphQL } from '../../../utils/graphql';
import { GRAPHQL_URL } from '../validate-deposit/route';

const GET_DEPOSITS_BY_WITHDRAWAL_ADDRESS = `
query GetDepositsByWithdrawalAddress($withdrawal_address: String!, $chainId: Int!) {
  Validator(
    where: { 
      withdrawal_address: { _eq: $withdrawal_address },
      chainId: { _eq: $chainId }
    }
  ) {
    pubkey
  }
}
`;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const address = searchParams.get('address');
        const chainId = searchParams.get('chainId');

        if (!address) return NextResponse.json({ error: 'Address parameter is required' }, { status: 400 });
        if (!chainId) return NextResponse.json({ error: 'chainId parameter is required' }, { status: 400 });

        const networkConfig = NETWORK_CONFIG[Number(chainId)];
        if (!networkConfig) return NextResponse.json({ error: 'Unsupported chainId' }, { status: 400 });

        if (!isAddress(address)) return NextResponse.json({ error: 'Invalid address' }, { status: 400 });

        const response = await fetchGraphQL(GRAPHQL_URL!, GET_DEPOSITS_BY_WITHDRAWAL_ADDRESS, {
            withdrawal_address: address.toLowerCase(),
            chainId: Number(chainId),
        });

        if (response.errors) {
            console.error('GraphQL Error:', response.errors);
            throw new Error('GraphQL returned an error.');
        }

        const deposits = response.data?.Validator || [];

        if (deposits.length === 0) {
            return NextResponse.json({ data: [] });
        }

        const pubkeys = deposits.map((d: any) => d.pubkey);

        const clEndpoint = networkConfig.clEndpoint;
        const multiplier = networkConfig.cl.multiplier;
        const allowedOrigin = new URL(clEndpoint).origin;

        const BATCH_SIZE = 50;
        const fetchPromises = [];

        for (let i = 0; i < pubkeys.length; i += BATCH_SIZE) {
            const chunk = pubkeys.slice(i, i + BATCH_SIZE);
            const url = new URL('/eth/v1/beacon/states/finalized/validators', clEndpoint);

            url.searchParams.set('id', chunk.join(','));

            if (url.origin === allowedOrigin) {
                fetchPromises.push(
                    fetch(url)
                        .then(res => {
                            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                            return res.json();
                        })
                );
            }
        }

        const results = await Promise.all(fetchPromises);
        const validators: APIValidatorInfo[] = [];

        for (const json of results) {
            if (!json || !json.data) continue;

            for (const v of json.data as BeaconChainResponse[]) {
                const creds = v.validator.withdrawal_credentials;
                const filterStatus = STATUS_TO_FILTER[v.status];

                validators.push({
                    index: Number(v.index),
                    pubkey: v.validator.pubkey as Address,
                    balance: (parseGwei(v.balance.toString()) / multiplier).toString(),
                    effectiveBalance: (parseGwei(v.validator.effective_balance.toString()) / multiplier).toString(),
                    withdrawal_credentials: creds,
                    type: creds.startsWith('0x02') ? 2 : creds.startsWith('0x01') ? 1 : 0,
                    filterStatus: filterStatus,
                    status: v.status,
                });
            }
        }

        validators.sort((a, b) => {
            const aIsActive = a.status.startsWith('active');
            const bIsActive = b.status.startsWith('active');

            if (aIsActive && !bIsActive) return -1;
            if (!aIsActive && bIsActive) return 1;
            return 0;
        });

        return NextResponse.json({ data: validators.slice(0, 500) });
    } catch (error) {
        console.error('Error fetching beacon validators by address:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}