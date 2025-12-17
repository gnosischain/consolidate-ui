import { useCallback, useState } from 'react';
import { useSendCallsSync, useSendTransactionSync } from 'wagmi';
import { Address } from 'viem';
import { useWallet } from '../context/WalletContext';

export interface TransactionCall {
  to: Address;
  data: `0x${string}`;
  value?: bigint;
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

interface UseTransactionReturn {
  /** Execute transactions - accepts single or multiple calls */
  execute: (calls: TransactionCall[]) => Promise<void>;
  /** Current progress of transaction execution */
  progress: TransactionProgress;
  /** Whether transactions are currently being processed */
  isPending: boolean;
  /** Whether all transactions completed successfully */
  isSuccess: boolean;
  /** Current error if any */
  error: Error | null;
}

const initialProgress: TransactionProgress = {
  currentIndex: 0,
  total: 0,
  status: 'idle',
};

export function useTransaction(): UseTransactionReturn {
  const { canBatch } = useWallet();
  const sendCalls = useSendCallsSync();
  const sendTransaction = useSendTransactionSync();

  const [progress, setProgress] = useState<TransactionProgress>(initialProgress);
  const [error, setError] = useState<Error | null>(null);

  const isPending = progress.status === 'pending';
  const isSuccess = progress.status === 'success';

  const execute = useCallback(
    async (callsInput: TransactionCall[]) => {
      setError(null);
      setProgress({ currentIndex: 0, total: callsInput.length, status: 'pending' });

      try {
        if (canBatch) {
          console.log('Executing batch of', callsInput.length, 'calls...');
          await sendCalls.mutateAsync({ calls: callsInput, capabilities: {} });
        } else {
          console.log('Executing', callsInput.length, 'calls sequentially...');
          for (let i = 0; i < callsInput.length; i++) {
            setProgress((p) => ({ ...p, currentIndex: i }));
            await sendTransaction.mutateAsync({
              to: callsInput[i].to,
              data: callsInput[i].data,
              value: callsInput[i].value,
            });
          }
        }
        setProgress((p) => ({ ...p, status: 'success' }));
      } catch (err) {
        console.error('Transaction error:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setProgress((p) => ({ ...p, status: 'error' }));
      }
    },
    [canBatch, sendCalls, sendTransaction]
  );

  return {
    execute,
    progress,
    isPending,
    isSuccess,
    error,
  };
}
