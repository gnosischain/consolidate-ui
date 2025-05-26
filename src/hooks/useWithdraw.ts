import { useCallback, useEffect, useRef } from 'react';
import { useCallsStatus, useSendCalls, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { Address, encodePacked, parseEther, parseGwei } from 'viem';

export interface Withdrawal {
	pubkey: Address;
	amount: number;
}

export function useWithdraw(contract: Address) {
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

	const withdrawalValidators = useCallback(
		(withdrawal: Withdrawal[]) => {
			if (withdrawal.length === 0) {
				throw new Error('No withdrawal possible with given chunk size')
			}
			lastBatchRef.current = withdrawal

			const calls = withdrawal.map(({ pubkey, amount }) => (
				{
					to: contract,
					data: encodePacked(
						["bytes", "uint64"],
						[
							pubkey,
							parseGwei(amount.toString()),
						],
					),
					value: parseEther('0.000001'),
				}))
			sendCalls({ calls, capabilities: {} })
		},
		[contract, sendCalls],
	)

	useEffect(() => {
		if (status === 'error' && lastBatchRef.current) {
			console.warn('Batch failed – falling back to individual txs')

			const calls = lastBatchRef.current.map(({ pubkey, amount }) => ({
				to: contract,
				data: encodePacked(
					["bytes", "uint64"],
					[
						pubkey,
						parseGwei(amount.toString()),
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
	}, [status, contract, sendTransaction])

	return { withdrawalValidators, callStatusData, isConfirming, isConfirmed };
}