import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { NetworkConfig } from '../constants/networks';
import { APIValidatorDetailsResponse, APIValidatorsResponse } from '../types/api';
import { ValidatorIndex, ValidatorInfo } from '../types/validators';
import { STATUS_TO_FILTER } from '../utils/status';
import { BeaconChainResponse } from '../types/beacon';

const LIMIT = 200;

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
					network.clEndpoint + '/eth/v1/beacon/states/finalized/validators',
				);
				if (!res.ok) {
					throw new Error(`HTTP ${res.status} - ${res.statusText}`);
				}

				const json = await res.json();
				const data: BeaconChainResponse[] = json.data;

				const filtered: ValidatorInfo[] = data
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
						return ({
							index: Number(v.index),
							pubkey: v.validator.pubkey,
							balanceEth: Number(v.validator.effective_balance) / 1e9 / network.cl.multiplier,
							withdrawal_credentials: address,
							type: creds.startsWith('0x02') ? 2 : creds.startsWith('0x01') ? 1 : 0,
							filterStatus: filterStatus,
							status: v.status,
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
				const allValidators: ValidatorIndex[] = [];
				let offset = 0;
				let keepGoing = true;

				while (keepGoing) {
					const list = await fetchValidatorsByAddress(network, address, offset);

					allValidators.push(...list);

					if (list.length === LIMIT && offset < 2000) {
						offset += LIMIT;
						await new Promise(res => setTimeout(res, 500));
					} else {
						keepGoing = false;
					}
				}

				if (allValidators.length === 0) {
					setValidators([]);
					return;
				}
				const batches = chunkArray(
					allValidators.map((v) => v.pubkey),
					50,
				);

				const detailed: ValidatorInfo[] = [];
				for (const pubkeyBatch of batches) {
					const batchDetails = await fetchValidatorDetailsBatch(network, pubkeyBatch);
					detailed.push(...batchDetails);
					await new Promise(res => setTimeout(res, 500));
				}
				setValidators(detailed);

			} catch (err) {
				setError(err as Error);
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

const fetchValidatorDetailsBatch = async (network: NetworkConfig, pubkeys: string[]): Promise<ValidatorInfo[]> => {
	const url = `${network.beaconchainApi}/api/v1/validator/${pubkeys.join(',')}`;
	const resp = await fetch(url);
	if (!resp.ok) {
		throw new Error(`Erreur ${resp.status} sur GET ${url}`);
	}
	const body: {
		data: APIValidatorDetailsResponse[] | APIValidatorDetailsResponse;
	} = await resp.json();

	const rows = Array.isArray(body.data) ? body.data : [body.data];

	return rows.map(d => {
		const creds = d.withdrawalcredentials;
		const address = `0x${creds.slice(-40)}` as Address;

		const filterStatus = STATUS_TO_FILTER[d.status];

		return {
			index: d.validatorindex,
			pubkey: d.pubkey as Address,
			balanceEth: d.effectivebalance / network.cl.multiplier / 1e9,
			withdrawal_credentials: address,
			type: creds.startsWith('0x02') ? 2 : 1,
			filterStatus: filterStatus,
			status: d.status,
		}
	})
};

const fetchValidatorsByAddress = async (network: NetworkConfig, address: string, offset: number): Promise<ValidatorIndex[]> => {
	const url = new URL(
		`/api/v1/validator/withdrawalCredentials/${address}`,
		network.beaconchainApi
	);
	url.searchParams.set('limit', String(LIMIT));
	url.searchParams.set('offset', String(offset));

	const resp = await fetch(url.toString());
	if (!resp.ok) {
		throw new Error(
			`Failed to fetch from ${url.toString()} – status ${resp.status}`
		);
	}
	const body: {
		data: APIValidatorsResponse[] | APIValidatorsResponse;
	} = await resp.json();

	const rows = Array.isArray(body.data) ? body.data : [body.data];

	return rows.map((d) => ({
		pubkey: d.publickey as Address,
		index: d.validatorindex,
	}));
};


