import { useCallback, useState } from 'react';
import { encodePacked, formatUnits, parseEther } from 'viem';
import { Withdrawal } from '../types/validators';
import { NetworkConfig } from '../types/network';
import { useTransaction, TransactionCall } from './useTransaction';
import { computeWithdrawals } from '../utils/withdrawal';

export function useWithdraw(network: NetworkConfig) {
  const [localError, setLocalError] = useState<Error | null>(null);
  const { execute, progress, isPending, isSuccess, error: txError } = useTransaction();

  const withdrawValidators = useCallback(
    (withdrawals: Withdrawal[]) => {
      setLocalError(null);

      if (withdrawals.length === 0) {
        setLocalError(new Error('No withdrawal possible with given chunk size'));
        return;
      }

      const calls: TransactionCall[] = withdrawals.map(({ pubkey, amount }) => ({
        to: network.withdrawalAddress,
        data: encodePacked(
          ['bytes', 'uint64'],
          [pubkey, BigInt(formatUnits(amount * network.cl.multiplier, 9))]
        ),
        value: parseEther('0.000001'),
      }));

      execute(calls);
    },
    [network, execute]
  );

  const error = localError || txError;

  return {
    withdrawValidators,
    computeWithdrawals: (
      validators: any,
      amountToWithdraw: bigint,
      totalValidatorBalance: bigint,
      preventExit = true
    ) => computeWithdrawals(validators, amountToWithdraw, totalValidatorBalance, network, preventExit),
    progress,
    isPending,
    isSuccess,
    error
  };
}
