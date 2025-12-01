import { useCallback, useState } from 'react';
import { useCallsStatus, useSendCalls, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { Address, encodePacked, formatUnits, parseEther } from 'viem';
import { Withdrawal } from '../types/validators';
import { NetworkConfig } from '../types/network';
import { useWallet } from '../context/WalletContext';
import { computeWithdrawals } from '../utils/withdrawal';

export function useWithdraw(network: NetworkConfig) {
	const { canBatch } = useWallet();
	const { data: hash, sendCalls, error: sendCallsError } = useSendCalls();
	const { data, sendTransaction, error: sendTransactionError } = useSendTransaction();
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

	const [error, setError] = useState<Error | null>(null);

	const withdrawValidators = useCallback(
		(withdrawal: Withdrawal[]) => {
			setError(null);

			if (withdrawal.length === 0) {
				setError(new Error('No withdrawal possible with given chunk size'));
				return;
			}

			const calls = withdrawal.map(({ pubkey, amount }) => ({
				to: network.withdrawalAddress,
				data: encodePacked(
					["bytes", "uint64"],
					[
						pubkey,
						BigInt(formatUnits(amount * network.cl.multiplier, 9)),
					],
				),
				value: parseEther('0.000001'),
			}));

			if (canBatch) {
				sendCalls({ calls, capabilities: {} });
			} else {
				Promise.all(calls.map((call) => sendTransaction({ to: call.to, data: call.data, value: call.value })))
					.catch((err) => {
						setError(err instanceof Error ? err : new Error(String(err)));
					});
			}
		},
		[network, sendCalls, canBatch, sendTransaction],
	);

	const combinedError = error || sendCallsError || sendTransactionError || null;

	return { 
		withdrawValidators, 
		computeWithdrawals: (validators: any, amountToWithdraw: bigint, totalValidatorBalance: bigint, preventExit = true) => 
			computeWithdrawals(validators, amountToWithdraw, totalValidatorBalance, network, preventExit),
		callStatusData, 
		isConfirming, 
		isConfirmed,
		error: combinedError,
	};
}