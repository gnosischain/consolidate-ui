import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { APIValidatorInfo } from '../types/api';
import { ValidatorInfo } from '../types/validators';
import { NetworkConfig } from '../types/network';
import { apiToValidatorInfo } from '../utils/apiConverters';
// import { BeaconApiValidatorsResponse } from '../types/beaconApi';
import { fetchGraphQL } from '../utils/graphql';
import { GRAPHQL_URL } from './useDeposit';

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

// const LIMIT = 200;

export function useBeaconValidators(
	network: NetworkConfig | undefined,
	address: Address | undefined,
) {
	const [validators, setValidators] = useState<ValidatorInfo[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		if (!network || !address) {
			return;
		}

		const fetchValidators = async () => {
			setLoading(true);

			try {
				const params = new URLSearchParams({
					address: address,
					chainId: network.chainId.toString(),
				});

				const res = await fetch(`/api/beacon-states?${params}`);
				if (!res.ok) {
					const errorData = await res.json();
					throw new Error(errorData.error || `HTTP ${res.status} - ${res.statusText}`);
				}

				const json: { data: APIValidatorInfo[] } = await res.json();
				const validators = json.data.map(apiToValidatorInfo);
				setValidators(validators);
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		// const fetchValidatorsApi = async () => {
		// 	setLoading(true);

		// 	try {
		// 		const allValidators: ValidatorIndex[] = [];
		// 		let offset = 0;
		// 		let keepGoing = true;

		// 		while (keepGoing) {
		// 			const list = await fetchValidatorsByAddress(network, address, offset);

		// 			allValidators.push(...list);

		// 			if (list.length === LIMIT && offset < 2000) {
		// 				offset += LIMIT;
		// 				await new Promise(res => setTimeout(res, 500));
		// 			} else {
		// 				keepGoing = false;
		// 			}
		// 		}

		// 		if (allValidators.length === 0) {
		// 			setValidators([]);
		// 			return;
		// 		}
		// 		const batches = chunkArray(
		// 			allValidators.map((v) => v.pubkey),
		// 			50,
		// 		);

		// 		const detailed: ValidatorInfo[] = [];
		// 		for (const pubkeyBatch of batches) {
		// 			const batchDetails = await fetchValidatorDetailsBatch(network, pubkeyBatch);
		// 			detailed.push(...batchDetails);
		// 			await new Promise(res => setTimeout(res, 500));
		// 		}
		// 		setValidators(detailed);
		// 	} catch (err) {
		// 		setError(err as Error);
		// 	} finally {
		// 		setLoading(false);
		// 	}
		// };

		const fetchValidatorsIndexer = async () => {
			setLoading(true);
			try {
				const withdrawalCredentials0x01 = "0x010000000000000000000000" + address.slice(2).toLowerCase();
				const withdrawalCredentials0x02 = "0x020000000000000000000000" + address.slice(2).toLowerCase();

				const [response0x01, response0x02] = await Promise.all([
					fetchGraphQL(GRAPHQL_URL, GET_DEPOSITS_BY_WITHDRAWAL_CREDENTIALS, {
						withdrawal_credentials: withdrawalCredentials0x01,
						chainId: network.chainId,
					}),
					fetchGraphQL(GRAPHQL_URL, GET_DEPOSITS_BY_WITHDRAWAL_CREDENTIALS, {
						withdrawal_credentials: withdrawalCredentials0x02,
						chainId: network.chainId,
					}),
				]);

				const deposits0x01 = response0x01.data?.SBCDepositContract_DepositEvent || [];
				const deposits0x02 = response0x02.data?.SBCDepositContract_DepositEvent || [];
				const allDeposits = [...deposits0x01, ...deposits0x02];
				const uniqueDeposits = allDeposits.filter(
					(deposit, index, self) => self.findIndex((d) => d.pubkey === deposit.pubkey) === index
				);

				if (uniqueDeposits.length === 0) {
					setValidators([]);
					return;
				}

				const pubkeys = uniqueDeposits.map((d) => d.pubkey);
				const batches = chunkArray(pubkeys, 10);
				const detailed: ValidatorInfo[] = [];

				for (const pubkeyBatch of batches) {
					const batchDetails = await fetchBeaconValidatorBatch(network, pubkeyBatch);
					detailed.push(...batchDetails);
					await new Promise(res => setTimeout(res, 200));
				}

				setValidators(detailed);
			} catch (err) {
				setError(err as Error);
			} finally {
				setLoading(false);
			}
		};

		if (network.beaconchainApi) {
			// fetchValidatorsApi();
			fetchValidatorsIndexer();
		} else {
			fetchValidators();
		}
	}, [address, network]);

	return { validators, loading, error };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
}

// const fetchValidatorDetailsBatch = async (network: NetworkConfig, pubkeys: string[]): Promise<ValidatorInfo[]> => {
// 	const params = new URLSearchParams({
// 		pubkeys: pubkeys.join(','),
// 		chainId: network.chainId.toString(),
// 	});

// 	const resp = await fetch(`/api/validator-details?${params}`);
// 	if (!resp.ok) {
// 		const errorData = await resp.json();
// 		throw new Error(errorData.error || `Error ${resp.status} on GET /api/validator-details`);
// 	}

// 	const body: { data: APIValidatorInfo[] } = await resp.json();
// 	return body.data.map(apiToValidatorInfo);
// };

const fetchBeaconValidatorBatch = async (network: NetworkConfig, pubkeys: string[]): Promise<ValidatorInfo[]> => {
	const params = new URLSearchParams({
		pubkeys: pubkeys.join(','),
		chainId: network.chainId.toString(),
	});

	const resp = await fetch(`/api/beacon-validator?${params}`);
	if (!resp.ok) {
		const errorData = await resp.json();
		throw new Error(errorData.error || `Error ${resp.status} on GET /api/beacon-validator`);
	}

	const body: { data: APIValidatorInfo[] } = await resp.json();
	return body.data.map(apiToValidatorInfo);
};

// const fetchValidatorsByAddress = async (network: NetworkConfig, address: string, offset: number): Promise<ValidatorIndex[]> => {
// 	const params = new URLSearchParams({
// 		address: address,
// 		offset: String(offset),
// 		chainId: network.chainId.toString(),
// 	});

// 	const resp = await fetch(`/api/validators?${params}`);
// 	if (!resp.ok) {
// 		const errorData = await resp.json();
// 		throw new Error(
// 			errorData.error || `Failed to fetch from /api/validators – status ${resp.status}`
// 		);
// 	}

// 	const body: {
// 		data: BeaconApiValidatorsResponse[] | BeaconApiValidatorsResponse;
// 	} = await resp.json();

// 	const rows = Array.isArray(body.data) ? body.data : [body.data];

// 	return rows.map((d) => ({
// 		pubkey: d.publickey,
// 		index: d.validatorindex,
// 	}));
// };


