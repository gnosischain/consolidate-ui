import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { NetworkConfig } from '../constants/networks';

/**
 * Type representing a Beacon chain validator for a given address.
 */
export interface ValidatorInfo {
	index: number;
	pubkey: Address;
	balanceEth: number;
	withdrawal_credentials: Address;
	type: number;
}

export function useBeaconValidators(network: NetworkConfig, address: Address) {
	const [validators, setValidators] = useState<ValidatorInfo[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		const fetchValidators = async () => {
			setLoading(true);

			try {
				// Normalize the address: remove 0x prefix and lowercase
				const addrHex = address.toLowerCase().replace(/^0x/, '');

				const res = await fetch(
					network.clEndpoint + '/eth/v1/beacon/states/finalized/validators?status=active_ongoing',
				);
				if (!res.ok) {
					throw new Error(`HTTP ${res.status} - ${res.statusText}`);
				}

				const json = await res.json();
				const data = json.data;

				const filtered: ValidatorInfo[] = data
					.filter((v: { validator: { withdrawal_credentials: string }; index: number }) => {
						const creds: string = v.validator.withdrawal_credentials;
						return (
							(creds.startsWith('0x01') || creds.startsWith('0x02')) && creds.endsWith(addrHex)
						);
					})
					.map((v: {
						index: string; validator: {
							withdrawal_credentials: string; pubkey: Address, effective_balance: string
						}
					}) => {
						const creds: string = v.validator.withdrawal_credentials;
						return ({
							index: Number(v.index),
							pubkey: v.validator.pubkey,
							balanceEth: Number(v.validator.effective_balance) / 1e9 / network.cl.multiplier,
							withdrawal_credentials: creds,
							type: creds.startsWith('0x02') ? 2 : creds.startsWith('0x01') ? 1 : 0,
						})
					});

				setValidators(filtered);
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		const fetchValidatorsApi = async () => {
			setLoading(true);

			try {
				const response = await fetch(`${network.beaconchainApi}/api/v1/validator/withdrawalCredentials/${address}`);

				console.log('Response:', response);
				if (!response.ok) {
					throw new Error(
						`Failed to fetch from ${network.beaconchainApi} - status: ${response.status}`,
					);
				}

				const { data: list }: { data: { publickey: string; validator_index: number }[] } =
					await response.json();

				if (list.length === 0) {
					setValidators([]);
					return;
				}

				const batches = chunkArray(
					list.map((v) => v.publickey),
					100,
				);

				const batchPromises = batches.map((pubkeys) =>
					fetchValidatorDetailsBatch(network, pubkeys),
				);
				const batchResults = await Promise.all(batchPromises);
				console.log('Batch results:', batchResults);

				setValidators(batchResults.flat());
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		if (network.beaconchainApi) {
			fetchValidatorsApi();
		} else {
			fetchValidators();
		}
	}, [network.beaconchainApi, network.clEndpoint, address, network]);

	return { validators, loading, error };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
}

const fetchValidatorDetailsBatch = async (network: NetworkConfig, pubkeys: string[]) => {
	const url = `${network.beaconchainApi}/api/v1/validator/${pubkeys.join(',')}`;
	const resp = await fetch(url);
	if (!resp.ok) {
		throw new Error(`Erreur ${resp.status} sur GET ${url}`);
	}
	const body: {
		data: Array<{
			validatorindex: number;
			pubkey: string;
			effectivebalance: number;
			withdrawalcredentials: string;
		}>;
	} = await resp.json();

	return body.data.map((d) => ({
		index: d.validatorindex,
		pubkey: d.pubkey as Address,
		balanceEth: d.effectivebalance / network.cl.multiplier / 1e9,
		withdrawal_credentials: d.withdrawalcredentials as Address,
		type: d.withdrawalcredentials.startsWith('0x02') ? 2 : d.withdrawalcredentials.startsWith('0x01') ? 1 : 0,
	}));
};
