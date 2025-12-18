import { useCallback } from 'react';
import { encodePacked, formatUnits, parseEther } from 'viem';
import { Withdrawal } from '../types/validators';
import { NetworkConfig } from '../types/network';
import { useTransaction, TransactionCall, UseTransactionOptions } from './useTransaction';
import { computeWithdrawals } from '../utils/withdrawal';

export function useWithdraw(network: NetworkConfig, options?: UseTransactionOptions) {
  const { execute, isPending } = useTransaction(options);

  const withdrawValidators = useCallback(
    (withdrawals: Withdrawal[]) => {

      if (withdrawals.length === 0) {
        return;
      }

      const calls: TransactionCall[] = withdrawals.map(({ pubkey, amount }) => ({
        to: network.withdrawalAddress,
        data: encodePacked(
          ['bytes', 'uint64'],
          [pubkey, BigInt(formatUnits(amount * network.cl.multiplier, 9))]
        ),
        value: parseEther('0.000001'),
        title: amount === 0n ? 'Exit' : 'Withdraw',
      }));

      execute(calls);
    },
    [network, execute]
  );

  return {
    withdrawValidators,
    computeWithdrawals: (
      validators: any,
      amountToWithdraw: bigint,
      totalValidatorBalance: bigint,
      preventExit = true
    ) => computeWithdrawals(validators, amountToWithdraw, totalValidatorBalance, network, preventExit),
    isPending
  };
}
