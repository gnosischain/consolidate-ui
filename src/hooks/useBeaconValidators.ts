import { useState, useEffect } from 'react';
import { Address } from 'viem';
import { APIValidatorInfo } from '../types/api';
import { ValidatorIndex, ValidatorInfo, ValidatorPendingInfo } from '../types/validators';
import { NetworkConfig } from '../types/network';
import { apiToValidatorInfo } from '../utils/apiConverters';
import { BeaconApiValidatorsResponse } from '../types/beaconApi';

const LIMIT = 200;

interface APIPendingStates {
	pendingWithdrawals: Array<{ validator_index: number; amount: string; withdrawable_epoch: string }>;
	pendingDeposits: Array<{ pubkey: string; amount: string }>;
	pendingConsolidations: Array<{ source_index: number; target_index: number }>;
}

export function useBeaconValidators(network: NetworkConfig | undefined, address: Address | undefined) {
	const [validators, setValidators] = useState<ValidatorInfo[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<unknown>(null);

	useEffect(() => {
		if (!network || !address) {
			return;
		}

		const fetchPendingStates = async (): Promise<APIPendingStates | null> => {
			try {
				const params = new URLSearchParams({
					clEndpoint: network.clEndpoint,
					clMultiplier: network.cl.multiplier.toString(),
				});

				const res = await fetch(`/api/pending-states?${params}`);
				if (!res.ok) {
					console.warn('Failed to fetch pending states');
					return null;
				}

				const json: { data: APIPendingStates } = await res.json();
				return json.data;
			} catch (err) {
				console.warn('Error fetching pending states:', err);
				return null;
			}
		};

		const enrichWithPendingInfo = (
			validators: ValidatorInfo[],
			pendingStates: APIPendingStates | null
		): ValidatorInfo[] => {
			if (!pendingStates) return validators;

			console.log('pendingStates', pendingStates.pendingWithdrawals);

			const withdrawalsByIndex = new Map<number, { amount: string; withdrawable_epoch: string }>();
			for (const w of pendingStates.pendingWithdrawals) {
				withdrawalsByIndex.set(w.validator_index, w);
			}

			console.log('withdrawalsByIndex', withdrawalsByIndex);

			const depositsByPubkey = new Map<string, { amount: string }>();
			for (const d of pendingStates.pendingDeposits) {
				depositsByPubkey.set(d.pubkey.toLowerCase(), d);
			}

			const consolidationsBySource = new Map<number, { target_index: number }>();
			const consolidationsByTarget = new Map<number, { source_index: number }>();
			for (const c of pendingStates.pendingConsolidations) {
				consolidationsBySource.set(c.source_index, { target_index: c.target_index });
				consolidationsByTarget.set(c.target_index, { source_index: c.source_index });
			}

			return validators.map((v) => {
				const withdrawal = withdrawalsByIndex.get(v.index);
				const deposit = depositsByPubkey.get(v.pubkey.toLowerCase());
				const consolidationAsSource = consolidationsBySource.get(v.index);
				const consolidationAsTarget = consolidationsByTarget.get(v.index);

				console.log('withdrawal', withdrawal);

				const pendingInfo: ValidatorPendingInfo = {
					hasPendingWithdrawal: !!withdrawal,
					pendingWithdrawalAmount: withdrawal ? BigInt(withdrawal.amount) : undefined,
					withdrawableEpoch: withdrawal?.withdrawable_epoch,
					hasPendingDeposit: !!deposit,
					pendingDepositAmount: deposit ? BigInt(deposit.amount) : undefined,
					hasPendingConsolidation: !!consolidationAsSource || !!consolidationAsTarget,
					isConsolidationSource: !!consolidationAsSource,
					isConsolidationTarget: !!consolidationAsTarget,
					consolidationTargetIndex: consolidationAsSource?.target_index,
					consolidationSourceIndex: consolidationAsTarget?.source_index,
				};

				return { ...v, pendingInfo };
			});
		};
		
		const fetchValidators = async () => {
			setLoading(true);

			try {
				const [validatorsRes, pendingStates] = await Promise.all([
					(async () => {
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
						return json.data.map(apiToValidatorInfo);
					})(),
					fetchPendingStates(),
				]);

				const enrichedValidators = enrichWithPendingInfo(validatorsRes, pendingStates);
				setValidators(enrichedValidators);
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

				// Fetch validator details and pending states
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

				// Fetch pending states and enrich validators
				const pendingStates = await fetchPendingStates();
				const enrichedValidators = enrichWithPendingInfo(detailed, pendingStates);
				setValidators(enrichedValidators);

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
