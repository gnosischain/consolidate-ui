//TODO : refactor this logic to handle tx queue directly from the Button Component

import { useCallback, useState, useEffect, useRef } from 'react';
import {
	useSendCalls,
	useSendTransaction,
	useWaitForTransactionReceipt,
	useCallsStatus,
} from 'wagmi';
import { Address } from 'viem';
import { toast } from 'react-hot-toast';
import { useWallet } from '../context/WalletContext';

export interface TransactionCall {
	to: Address;
	data: `0x${string}`;
	value?: bigint;
	title?: string;
}

export interface UseTransactionOptions {
	onSuccess?: () => void;
}

interface UseTransactionReturn {
	execute: (calls: TransactionCall[]) => void;
	isPending: boolean;
}

export function useTransaction(options?: UseTransactionOptions): UseTransactionReturn {
	const { canBatch } = useWallet();
	const {
		data: callsData,
		mutate: mutateCalls,
		error: sendCallsError,
		status: sendCallsStatus,
	} = useSendCalls();
	const {
		data: txHash,
		mutate: mutateTransaction,
		error: sendTxError,
		status: sendTxStatus,
	} = useSendTransaction();

	const { isSuccess: isTxConfirmed, isPending: isTxPending } = useWaitForTransactionReceipt({
		hash: txHash,
	});

	const { data: callStatusData } = useCallsStatus({
		id: callsData?.id || '',
		query: {
			enabled: !!callsData,
			refetchInterval: (data) =>
				data.state.data?.status === 'success' || data.state.data?.status === 'failure'
					? false
					: 1000,
		},
	});

	const [currentCalls, setCurrentCalls] = useState<TransactionCall[]>([]);
	const [queueIndex, setQueueIndex] = useState(0);
	const toastId = useRef<string | undefined>(undefined);
	const hasCalledOnSuccess = useRef(false);

	// Derive status directly from wagmi hooks
	const isBatchPending =
		sendCallsStatus === 'pending' ||
		(!!callsData && callStatusData?.status !== 'success' && callStatusData?.status !== 'failure');
	const isSinglePending = sendTxStatus === 'pending' || isTxPending;

	const isPending = currentCalls.length > 0 && (canBatch ? isBatchPending : isSinglePending);
	const isSuccess = canBatch ? callStatusData?.status === 'success' : isTxConfirmed;
	const isError = sendCallsError || sendTxError || callStatusData?.status === 'failure';

	// Generate toast message
	const getToastMessage = useCallback(() => {
		if (currentCalls.length === 0) return 'Processing...';

		if (canBatch) {
			const titles = currentCalls.map((c) => c.title).filter(Boolean);
			const uniqueTitles = [...new Set(titles)];
			if (uniqueTitles.length === 0) {
				return `Processing batch (${currentCalls.length} transactions)...`;
			}
			return `Processing ${uniqueTitles.join(', ')}...`;
		} else {
			const total = currentCalls.length;
			const currentTitle = currentCalls[queueIndex]?.title || 'Transaction';
			return `${total > 1 ? `${queueIndex + 1}/${total}: ` : ''}${currentTitle}`;
		}
	}, [currentCalls, canBatch, queueIndex]);

	// Show/dismiss loading toast based on isPending
	useEffect(() => {
		if (isPending && currentCalls.length > 0) {
			const message = getToastMessage();
			if (toastId.current) {
				toast.loading(message, { id: toastId.current });
			} else {
				toastId.current = toast.loading(message);
			}
		} else if (!isPending && toastId.current) {
			toast.dismiss(toastId.current);
			toastId.current = undefined;
		}
	}, [isPending, currentCalls.length, getToastMessage]);

	// Advance queue or complete on single tx success
	useEffect(() => {
		if (!isSuccess || canBatch || currentCalls.length === 0) return;

		const nextIndex = queueIndex + 1;

		if (nextIndex < currentCalls.length) {
			// Send the next transaction in the queue
			setQueueIndex(nextIndex);
			const next = currentCalls[nextIndex];
			mutateTransaction({ to: next.to, data: next.data, value: next.value });
		} else if (!hasCalledOnSuccess.current) {
			// All done
			hasCalledOnSuccess.current = true;
			const titles = currentCalls.map((c) => c.title).filter(Boolean);
			const uniqueTitles = [...new Set(titles)];
			const successMessage =
				uniqueTitles.length > 0
					? `${uniqueTitles.join(', ')} successful`
					: 'Transaction successful';
			toast.success(successMessage);
			options?.onSuccess?.();
			setCurrentCalls([]);
			setQueueIndex(0);
		}
	}, [isSuccess, canBatch, currentCalls, queueIndex, mutateTransaction, options]);

	// Handle batch success
	useEffect(() => {
		if (!isSuccess || !canBatch || currentCalls.length === 0 || hasCalledOnSuccess.current) return;

		hasCalledOnSuccess.current = true;
		const titles = currentCalls.map((c) => c.title).filter(Boolean);
		const uniqueTitles = [...new Set(titles)];
		const successMessage =
			uniqueTitles.length > 0 ? `${uniqueTitles.join(', ')} successful` : 'Transaction successful';
		toast.success(successMessage);
		options?.onSuccess?.();
		setCurrentCalls([]);
	}, [isSuccess, canBatch, currentCalls, options]);

	// Handle errors
	useEffect(() => {
		if (isError && currentCalls.length > 0) {
			const errorMsg = sendCallsError?.message || sendTxError?.message || 'Transaction failed';
			toast.error(errorMsg.substring(0, 50));
			setCurrentCalls([]);
			setQueueIndex(0);
		}
	}, [isError, sendCallsError, sendTxError, currentCalls.length]);

	const execute = useCallback(
		(callsInput: TransactionCall[]) => {
			if (callsInput.length === 0) return;

			setCurrentCalls(callsInput);
			setQueueIndex(0);
			hasCalledOnSuccess.current = false;

			if (canBatch) {
				mutateCalls({ calls: callsInput, capabilities: {} });
			} else {
				mutateTransaction({
					to: callsInput[0].to,
					data: callsInput[0].data,
					value: callsInput[0].value,
				});
			}
		},
		[canBatch, mutateCalls, mutateTransaction],
	);

	return {
		execute,
		isPending,
	};
}
