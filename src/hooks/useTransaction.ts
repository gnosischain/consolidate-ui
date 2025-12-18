import { useCallback, useState, useEffect, useRef } from 'react';
import { useSendCalls, useSendTransaction, useWaitForTransactionReceipt, useCallsStatus } from 'wagmi';
import { Address } from 'viem';
import { toast } from 'react-hot-toast';
import { useWallet } from '../context/WalletContext';

export interface TransactionCall {
  to: Address;
  data: `0x${string}`;
  value?: bigint;
  title?: string;
}

export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface TransactionProgress {
  /** Current transaction index being processed (0-based) */
  currentIndex: number;
  /** Total number of transactions */
  total: number;
  /** Current status */
  status: TransactionStatus;
}

export interface UseTransactionOptions {
  onSuccess?: () => void;
}

interface UseTransactionReturn {
  execute: (calls: TransactionCall[]) => void;
  isPending: boolean;
}

const initialProgress: TransactionProgress = {
  currentIndex: 0,
  total: 0,
  status: 'idle',
};

export function useTransaction(options?: UseTransactionOptions): UseTransactionReturn {
  const { canBatch } = useWallet();
  const { data: callsData, mutate: mutateCalls, error: sendCallsError } = useSendCalls();
  const { data: txHash, mutate: mutateTransaction, error: sendTxError } = useSendTransaction();
  
  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });
  
  const { data: callStatusData } = useCallsStatus({
    id: callsData?.id || '',
    query: {
      enabled: !!callsData,
      refetchInterval: (data) => data.state.data?.status === 'success' ? false : 1000,
    },
  });
  
  const [progress, setProgress] = useState<TransactionProgress>(initialProgress);
  const [currentCalls, setCurrentCalls] = useState<TransactionCall[]>([]);
  const toastId = useRef<string | undefined>(undefined);
  const hasCalledOnSuccess = useRef(false);

  const isConfirmed = isTxConfirmed || callStatusData?.status === 'success';
  
  const isPending = progress.status === 'pending';
  const isSuccess = progress.status === 'success' || isConfirmed;

  // Generate toast message based on current state
  const getToastMessage = useCallback(() => {
    if (currentCalls.length === 0) return 'Processing...';
    
    if (canBatch) {
      // For batched transactions, show a summary
      const titles = currentCalls
        .map(c => c.title)
        .filter(Boolean);
      
      if (titles.length === 0) {
        return `Processing batch (${currentCalls.length} transactions)`;
      }
      
      const uniqueTitles = [...new Set(titles)];
      return `Processing ${uniqueTitles.join(', ')}`;
    } else {
      // For sequential transactions, show progress
      const { currentIndex, total } = progress;
      const currentTitle = currentCalls[currentIndex]?.title || 'Transaction';
      return `${currentIndex + 1}/${total}: Processing ${currentTitle}`;
    }
  }, [canBatch, currentCalls, progress]);

  // Handle toast for pending state
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
  }, [isPending, getToastMessage, currentCalls.length]);

  // Handle success toast and callback
  useEffect(() => {
    if (isSuccess && currentCalls.length > 0 && !hasCalledOnSuccess.current) {
      hasCalledOnSuccess.current = true;
      
      const titles = currentCalls.map(c => c.title).filter(Boolean);
      const uniqueTitles = [...new Set(titles)];
      const successMessage = uniqueTitles.length > 0
        ? `${uniqueTitles.join(', ')} successful`
        : 'Transaction successful';
      
      toast.success(successMessage);
      options?.onSuccess?.();
    }
  }, [isSuccess, currentCalls, options]);

  // Handle error toast
  useEffect(() => {
    const combinedError = sendCallsError || sendTxError;
    if (combinedError) {
      toast.error(combinedError.message.substring(0, 50));
    }
  }, [sendCallsError, sendTxError]);

  const execute = useCallback(
    (callsInput: TransactionCall[]) => {
      setCurrentCalls(callsInput);
      setProgress({ currentIndex: 0, total: callsInput.length, status: 'pending' });
      hasCalledOnSuccess.current = false;

      if (canBatch) {
        console.log('Executing batch of', callsInput.length, 'calls...');
        mutateCalls({ calls: callsInput, capabilities: {} });
      } else {
        console.log('Executing', callsInput.length, 'calls in parallel...');
        callsInput.forEach((call) => {
          mutateTransaction({
            to: call.to,
            data: call.data,
            value: call.value,
          });
        });
      }
    },
    [canBatch, mutateCalls, mutateTransaction]
  );

  return {
    execute,
    isPending,
  };
}
