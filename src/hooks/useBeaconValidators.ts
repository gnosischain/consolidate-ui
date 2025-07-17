import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { APIValidatorInfo } from '../types/api';
import { ValidatorIndex, ValidatorInfo } from '../types/validators';
import { NetworkConfig } from '../types/network';
import { apiToValidatorInfo } from '../utils/apiConverters';
import { BeaconApiValidatorsResponse } from '../types/beaconApi';

const LIMIT = 200;

export function useBeaconValidators(network: NetworkConfig, address: Address) {
	const [validators, setValidators] = useState<ValidatorInfo[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		const fetchValidators = async () => {
			setLoading(true);

			try {
				const params = new URLSearchParams({
					address: address,
					clEndpoint: network.clEndpoint,
					clMultiplier: network.cl.multiplier.toString(),
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
	const params = new URLSearchParams({
		pubkeys: pubkeys.join(','),
		beaconchainApiUrl: network.beaconchainApi || '',
		clMultiplier: network.cl.multiplier.toString(),
	});

	const resp = await fetch(`/api/validator-details?${params}`);
	if (!resp.ok) {
		const errorData = await resp.json();
		throw new Error(errorData.error || `Error ${resp.status} on GET /api/validator-details`);
	}
	
	const body: { data: APIValidatorInfo[] } = await resp.json();
	return body.data.map(apiToValidatorInfo);
};

const fetchValidatorsByAddress = async (network: NetworkConfig, address: string, offset: number): Promise<ValidatorIndex[]> => {
	const params = new URLSearchParams({
		address: address,
		offset: String(offset),
		beaconchainApiUrl: network.beaconchainApi || '',
	});

	const resp = await fetch(`/api/validators?${params}`);
	if (!resp.ok) {
		const errorData = await resp.json();
		throw new Error(
			errorData.error || `Failed to fetch from /api/validators – status ${resp.status}`
		);
	}

	const body: {
		data: BeaconApiValidatorsResponse[] | BeaconApiValidatorsResponse;
	} = await resp.json();

	const rows = Array.isArray(body.data) ? body.data : [body.data];

	return rows.map((d) => ({
		pubkey: d.publickey,
		index: d.validatorindex,
	}));
};


