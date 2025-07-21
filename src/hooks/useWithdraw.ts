import { useCallback, useEffect, useRef } from 'react';
import { useCallsStatus, useSendCalls, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { Address, encodePacked, formatUnits, parseEther } from 'viem';
import { ValidatorInfo, Withdrawal } from '../types/validators';
import { NetworkConfig } from '../types/network';

export function useWithdraw(network: NetworkConfig) {
	const { data: hash, sendCalls, status } = useSendCalls();
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


	const lastBatchRef = useRef<Withdrawal[] | null>(null)

	const computeWithdrawals = useCallback(
		(validators: ValidatorInfo[], amountToWithdraw: bigint, totalValidatorBalance: bigint, preventExit = true) => {
			if (totalValidatorBalance === 0n || amountToWithdraw <= 0n) {
				return { withdrawals: [], exits: [], withdrawalsAmount: 0n };
			}

			const exitBuffer = preventExit ? parseEther(network.cl.minBalance.toString()) : 0n;
			const eligibleValidators = validators.filter(v => v.balanceEth > exitBuffer);

			const withdrawals: Withdrawal[] = [];
			const exits: ValidatorInfo[] = [];

			for (const v of eligibleValidators) {
				const maxWithdrawable = v.balanceEth - BigInt(exitBuffer);
				const proportionalAmount = (v.balanceEth * amountToWithdraw) / totalValidatorBalance;
				let rawAmount = proportionalAmount < maxWithdrawable ? proportionalAmount : maxWithdrawable;

				if (!preventExit) {
					const leftover = v.balanceEth - rawAmount;
					if (leftover > 0 && leftover < parseEther(network.cl.minBalance.toString())) {
						rawAmount = v.balanceEth;
					}
				}

				if (rawAmount > 0) {
					withdrawals.push({ pubkey: v.pubkey, amount: !preventExit && rawAmount === v.balanceEth ? 0n : rawAmount }); // an exit is triggered by setting amount to 0

					if (!preventExit && rawAmount === v.balanceEth) {
						exits.push(v);
					}
				}
			}

			return {
				withdrawals,
				exits,
				withdrawalsAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0n),
			};
		}, [network]);

	const withdrawalValidators = useCallback(
		(withdrawal: Withdrawal[]) => {
			if (withdrawal.length === 0) {
				throw new Error('No withdrawal possible with given chunk size')
			}
			lastBatchRef.current = withdrawal

			const calls = withdrawal.map(({ pubkey, amount }) => (
				{
					to: network.withdrawalAddress,
					data: encodePacked(
						["bytes", "uint64"],
						[
							pubkey,
							BigInt(formatUnits(amount * network.cl.multiplier, 9)),
						],
					),
					value: parseEther('0.000001'),
				}))
			sendCalls({ calls, capabilities: {} })
		},
		[network, sendCalls],
	)


	useEffect(() => {
		if (status === 'error' && lastBatchRef.current) {
			console.warn('Batch failed – falling back to individual txs')

			const calls = lastBatchRef.current.map(({ pubkey, amount }) => ({
				to: network.withdrawalAddress,
				data: encodePacked(
					["bytes", "uint64"],
					[
						pubkey,
						BigInt(formatUnits(amount * network.cl.multiplier, 9)),
					],
				),
				value: parseEther('0.000001'),
			}))

			Promise.all(
				calls.map((call) =>
					sendTransaction({
						to: call.to,
						data: call.data,
						value: call.value,
					})
				),
			).then(() => {
				console.log('All individual transactions submitted')
			}).catch((err) => {
				console.error('Fallback submission error', err)
			})
		}
	}, [status, network, sendTransaction])

	return { withdrawalValidators, callStatusData, isConfirming, isConfirmed, computeWithdrawals };
}