import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { TransactionCall } from '../types/transaction';
import { useTxQueue } from '../hooks/useTxQueue';
import { useWallet } from '../context/WalletContext';

interface TransactionButtonProps {
	calls: TransactionCall[];
	onSuccess?: () => void;
	disabled?: boolean;
	className?: string;
	children: React.ReactNode;
}

export function TransactionButton({
	calls,
	onSuccess,
	disabled,
	className,
	children,
}: TransactionButtonProps) {
	const { canBatch } = useWallet();
	const { sendSingle, sendBatch, isPending, isConfirmed, isError, error, txHash, reset } =
		useTxQueue();
	const [queueIndex, setQueueIndex] = useState<number | null>(null);
	const handledHash = useRef<string | null>(null);
	const toastId = useRef<string | undefined>(undefined);

	const total = calls.length;
	const isActive = queueIndex !== null;

	// Loading toast — update message as queue advances
	useEffect(() => {
		if (!isPending || !isActive) return;
		const idx = queueIndex ?? 0;
		const step = !canBatch && total > 1 ? `${idx + 1}/${total}: ` : '';
		const title = canBatch
			? [...new Set(calls.map((c) => c.title).filter(Boolean))].join(', ') || 'transaction'
			: (calls[idx]?.title ?? 'Transaction');
		const msg = `${step}${title}`;
		if (toastId.current) {
			toast.loading(msg, { id: toastId.current });
		} else {
			toastId.current = toast.loading(msg);
		}
	}, [isPending, queueIndex, canBatch, calls, total]);

	useEffect(() => {
		if (isPending || isError || !toastId.current) return;
		toast.dismiss(toastId.current);
		toastId.current = undefined;
	}, [isPending, isError]);

	// On confirmation: pure state transition — no mutations here
	useEffect(() => {
		if (!isConfirmed || !isActive) return;
		if (!canBatch) {
			if (!txHash || txHash === handledHash.current) return;
			handledHash.current = txHash;
		}

		const nextIndex = (queueIndex ?? 0) + 1;
		if (canBatch || nextIndex >= total) {
			const titles = [...new Set(calls.map((c) => c.title).filter(Boolean))];
			toast.success(
				titles.length > 0 ? `${titles.join(', ')} successful` : 'Transaction successful',
			);
			onSuccess?.();
			setQueueIndex(null);
			reset();
			handledHash.current = null;
		} else {
			// Advance index — button becomes active again for next tx, user must click
			setQueueIndex(nextIndex);
		}
	}, [isConfirmed, txHash, canBatch, queueIndex, total, calls, onSuccess, reset]);

	// Error handling
	useEffect(() => {
		if (!isError || !isActive) return;
		const id = toastId.current;
		toastId.current = undefined;
		toast.error((error?.message ?? 'Transaction failed').substring(0, 50), id ? { id } : undefined);
		setQueueIndex(null);
		reset();
		handledHash.current = null;
	}, [isError, error, isActive, reset]);

	// Mutations only happen here, in the click handler
	const handleClick = useCallback(() => {
		if (isPending || calls.length === 0) return;
		if (canBatch) {
			setQueueIndex(0);
			sendBatch(calls);
		} else {
			const idx = queueIndex ?? 0;
			if (queueIndex === null) setQueueIndex(0);
			sendSingle(calls[idx]);
		}
	}, [isPending, canBatch, queueIndex, calls, sendBatch, sendSingle]);

	const label = () => {
		if (isPending) return 'Processing...';
		if (!canBatch && isActive && queueIndex! > 0) {
			const title = calls[queueIndex!]?.title ?? 'Continue';
			return total > 1 ? `${queueIndex! + 1}/${total}: ${title}` : title;
		}
		return children;
	};

	return (
		<button
			className={className}
			disabled={disabled || isPending || calls.length === 0}
			onClick={handleClick}
		>
			{label()}
		</button>
	);
}
