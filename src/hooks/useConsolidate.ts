import { useCallback } from 'react';
import { useCallsStatus, useSendCalls, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { Address, concat, parseEther } from 'viem';
import { Consolidation, ValidatorInfo, CredentialType } from '../types/validators';
import { useWallet } from '../context/WalletContext';

interface ComputedConsolidation {
	consolidations: Consolidation[];
	skippedValidators: ValidatorInfo[];
	targets: Set<number>;
}

export function computeConsolidations(
	compounding: ValidatorInfo[],
	type1: ValidatorInfo[],
	chunkSize: bigint
): ComputedConsolidation {
	const consolidations: Consolidation[] = []
	const skippedValidators: ValidatorInfo[] = []
	const targets = new Set<number>()

	const remaining = [
		...compounding.map((v) => ({ ...v, type: 2 as CredentialType })),
		...type1.map((v) => ({ ...v, type: 1 as CredentialType })),
	]

	while (remaining.length > 0) {
		const target = remaining.shift()!
		let tb = target.balanceEth

		if (tb >= chunkSize) {
			skippedValidators.push(target)
			continue
		}

		if (target.type === 1) {
			consolidations.push({
				sourceIndex: target.index,
				sourceKey: target.pubkey,
				sourceBalance: target.balanceEth,
				targetIndex: target.index,
				targetKey: target.pubkey,
				targetBalance: 0n,
			})
		}

		for (let i = 0; i < remaining.length;) {
			const cand = remaining[i]
			if (tb + cand.balanceEth <= chunkSize) {
				consolidations.push({
					sourceIndex: cand.index,
					sourceKey: cand.pubkey,
					sourceBalance: cand.balanceEth,
					targetIndex: target.index,
					targetKey: target.pubkey,
					targetBalance: tb,
				})
				tb += cand.balanceEth
				remaining.splice(i, 1)
			} else {
				i++
			}
		}

		targets.add(target.index)
	}

	return { consolidations, skippedValidators, targets }
}

export function useConsolidateValidatorsBatch() {
	const { network, canBatch } = useWallet();
	const { data: hash, sendCalls } = useSendCalls();
	const { data, sendTransaction } = useSendTransaction();
	const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
		hash: data as Address,
	});
	const { data: callStatusData } = useCallsStatus({
		id: hash?.id || '',
		query: {
			enabled: !!hash,
			refetchInterval: (data) => data.state.data?.status === "success" ? false : 1000,
		},
	});

	const consolidateValidators = useCallback(
		(consolidations: Consolidation[]) => {
			if (consolidations.length === 0) {
				throw new Error('No consolidation possible with given chunk size')
			}

			if (!network?.consolidateAddress) {
				throw new Error('Network consolidation address not available')
			}

			if (canBatch) {

				const calls = consolidations.map(({ sourceKey, targetKey }) => ({
					to: network.consolidateAddress,
					data: concat([sourceKey, targetKey]),
					value: parseEther('0.000001'),
				}))

				console.log('Attempting batch of', calls.length, 'calls…')
				sendCalls({ calls, capabilities: {} })
			} else {
				const calls = consolidations.map(({ sourceKey, targetKey }) => ({
					to: network.consolidateAddress,
					data: concat([sourceKey, targetKey]),
					value: parseEther('0.000001'),
				}))
				Promise.all(calls.map((call) => sendTransaction({ to: call.to, data: call.data, value: call.value })))
					.then(() => {
						console.log('All individual transactions submitted')
					})
					.catch((err) => {
						console.error('Fallback submission error', err)
					})
			}
		},
		[network, sendCalls, canBatch, sendTransaction],
	)

	return { consolidateValidators, callStatusData, isConfirming, isConfirmed };
}

export function computeSelfConsolidations(
	validators: ValidatorInfo[],
): Consolidation[] {
	const selfConsolidations: Consolidation[] = [];

	for (const v of validators) {
		selfConsolidations.push({ sourceIndex: v.index, sourceKey: v.pubkey, sourceBalance: 1n, targetIndex: v.index, targetKey: v.pubkey, targetBalance: 0n });
	}

	return selfConsolidations;
}