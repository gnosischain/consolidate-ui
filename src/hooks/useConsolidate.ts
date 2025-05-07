import { useCallback } from 'react';
import { useCallsStatus, useSendCalls } from 'wagmi';
import { Address, concat, parseEther } from 'viem';
import { ValidatorInfo } from './useBeaconValidators';

export interface Consolidation {
	sourceIndex: number;
	sourceKey: Address;
	sourceBalance: number;
	targetIndex: number;
	targetKey: Address;
	targetBalance: number;
}

interface ComputedConsolidation {
	consolidations: Consolidation[];
	skippedValidators: ValidatorInfo[];
	targets: Set<ValidatorInfo>;
}

// TODO: Improve this. Right now the balances are rounded to the nearest integer,
// which is not ideal but at least works closer to what one would expect.
export function computeConsolidations(
	validators: ValidatorInfo[],
	chunkSize: number,
): ComputedConsolidation {
	const consolidations: Consolidation[] = [];
	const skippedValidators: ValidatorInfo[] = [];
	const remaining = [...validators];
	const targets = new Set<ValidatorInfo>()
	let target;

	while ((target = remaining.shift())) {
		let targetBalance = target.balanceEth;

		if (targetBalance >= chunkSize) {
			skippedValidators.push(target);
			continue;
		}

		for (let i = 0; i < remaining.length;) {
			const candidate = remaining[i];

			if (targetBalance + candidate.balanceEth <= chunkSize) {
				targets.add(target);
				consolidations.push({
					sourceIndex: candidate.index,
					sourceKey: candidate.pubkey,
					sourceBalance: candidate.balanceEth,
					targetIndex: target.index,
					targetKey: target.pubkey,
					targetBalance: targetBalance,
				});
				targetBalance += candidate.balanceEth;
				remaining.splice(i, 1);
			} else {
				i++;
			}
		}
	}

	return { consolidations, skippedValidators, targets };
}

interface ConsolidationSimulationResult {
	totalGroups: number;
	consolidations: Consolidation[];
	skippedValidators: ValidatorInfo[];
}

export function simulateConsolidation(
	compoundingValidators: ValidatorInfo[],
	type1Validators: ValidatorInfo[],
	chunkSize: number,
	includeType1: boolean,
): ConsolidationSimulationResult {
	const initialCount = compoundingValidators.length + type1Validators.length;
  
	const selfCalls: Consolidation[] = includeType1
	  ? computeSelfConsolidations(type1Validators)
	  : [];
	const groupingSet = includeType1
	  ? [...compoundingValidators, ...type1Validators]
	  : compoundingValidators;
  
	const {
	  consolidations: mergeCalls,
	  skippedValidators,
	} = computeConsolidations(groupingSet, chunkSize);
  
	const mergeCount = mergeCalls.length;
  
	const totalGroups = initialCount - mergeCount;
  
	return {
	  totalGroups,
	  consolidations: [...selfCalls, ...mergeCalls],
	  skippedValidators,
	};
  }

export function useConsolidateValidatorsBatch(contract: Address) {
	const { data: hash, sendCalls } = useSendCalls();
	// const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
	// 	hash: hash?.id as Address,
	// });

	const { data: callStatusData } = useCallsStatus({
		id: hash?.id || '',
		query: {
			enabled: !!hash,
			refetchInterval: (data) => data.state.data?.status === "success" ? false : 1000,
		},
	});

	const consolidateValidators = useCallback(
		async (consolidations: Consolidation[]) => {

			if (consolidations.length === 0) {
				throw new Error('No consolidation possible with given chunk size');
			}

			const calls = consolidations.map(({ sourceKey, targetKey }) => ({
				to: contract,
				data: concat([sourceKey, targetKey]),
				value: parseEther('0.000001'),
			}));

			console.log('Sending batch of', calls.length, 'calls');

			sendCalls({
				calls,
				capabilities: {},
			});
		},
		[contract, sendCalls],
	);

	return { consolidateValidators, callStatusData };
}

export function computeSelfConsolidations(
	validators: ValidatorInfo[],
): Consolidation[] {
	const selfConsolidations: Consolidation[] = [];

	for (const v of validators) {
		selfConsolidations.push({ sourceIndex: v.index, sourceKey: v.pubkey, sourceBalance: 1, targetIndex: v.index, targetKey: v.pubkey, targetBalance: 0 });
	}

	return selfConsolidations;
}