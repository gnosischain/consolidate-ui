import { NextRequest, NextResponse } from 'next/server';
import { Address, parseGwei } from 'viem';
import { APIValidatorInfo } from '../../../types/api';
import { BeaconChainResponse } from '../../../types/beacon';
import { STATUS_TO_FILTER } from '../../../utils/status';
import { NETWORK_CONFIG } from '../../../constants/networks';
import { fetchGraphQL } from '../../../utils/graphql';
import { GRAPHQL_URL } from '../validate-deposit/route';

const GET_DEPOSITS_BY_WITHDRAWAL_CREDENTIALS = `
query GetDepositsByWithdrawalCredentials($withdrawal_credentials: String!, $chainId: Int!) {
  SBCDepositContract_DepositEvent(
    where: { 
      withdrawal_credentials: { _eq: $withdrawal_credentials },
      chainId: { _eq: $chainId }
    }
  ) {
    pubkey
    index
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

        const withdrawalCredentials0x01 = "0x010000000000000000000000" + address.slice(2).toLowerCase();
        const withdrawalCredentials0x02 = "0x020000000000000000000000" + address.slice(2).toLowerCase();

        const [response0x01, response0x02] = await Promise.all([
            fetchGraphQL(GRAPHQL_URL!, GET_DEPOSITS_BY_WITHDRAWAL_CREDENTIALS, {
                withdrawal_credentials: withdrawalCredentials0x01,
                chainId: Number(chainId),
            }),
            fetchGraphQL(GRAPHQL_URL!, GET_DEPOSITS_BY_WITHDRAWAL_CREDENTIALS, {
                withdrawal_credentials: withdrawalCredentials0x02,
                chainId: Number(chainId),
            }),
        ]);

        const deposits0x01 = response0x01.data?.SBCDepositContract_DepositEvent || [];
        const deposits0x02 = response0x02.data?.SBCDepositContract_DepositEvent || [];
        const allDeposits = [...deposits0x01, ...deposits0x02];

        const uniqueDeposits = allDeposits.filter(
            (deposit, index, self) => self.findIndex((d) => d.pubkey === deposit.pubkey) === index
        );

        if (uniqueDeposits.length === 0) {
            return NextResponse.json({ data: [] });
        }

        const pubkeys = uniqueDeposits.map((d) => d.pubkey);

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