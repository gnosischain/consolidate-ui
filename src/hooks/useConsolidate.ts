import { useCallback, useState } from 'react';
import { concat, parseEther } from 'viem';
import { Consolidation, ValidatorInfo, CredentialType } from '../types/validators';
import { useWallet } from '../context/WalletContext';
import { useTransaction, TransactionCall } from './useTransaction';

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
  const consolidations: Consolidation[] = [];
  const skippedValidators: ValidatorInfo[] = [];
  const targets = new Set<number>();

  const remaining = [
    ...compounding.map((v) => ({ ...v, type: 2 as CredentialType })),
    ...type1.map((v) => ({ ...v, type: 1 as CredentialType })),
  ];

  while (remaining.length > 0) {
    const target = remaining.shift()!;
    let tb = target.balance;

    if (tb >= chunkSize) {
      skippedValidators.push(target);
      continue;
    }

    if (target.type === 1) {
      consolidations.push({
        sourceIndex: target.index,
        sourceKey: target.pubkey,
        sourceBalance: target.balance,
        targetIndex: target.index,
        targetKey: target.pubkey,
        targetBalance: 0n,
      });
    }

    for (let i = 0; i < remaining.length;) {
      const cand = remaining[i];
      if (tb + cand.balance <= chunkSize) {
        consolidations.push({
          sourceIndex: cand.index,
          sourceKey: cand.pubkey,
          sourceBalance: cand.balance,
          targetIndex: target.index,
          targetKey: target.pubkey,
          targetBalance: tb,
        });
        tb += cand.balance;
        remaining.splice(i, 1);
      } else {
        i++;
      }
    }

    targets.add(target.index);
  }

  return { consolidations, skippedValidators, targets };
}

export function useConsolidateValidatorsBatch() {
  const { network } = useWallet();
  const [localError, setLocalError] = useState<Error | null>(null);
  const { execute, progress, isPending, isSuccess, error: txError } = useTransaction();

  const consolidateValidators = useCallback(
    (consolidations: Consolidation[]) => {
      setLocalError(null);

      if (consolidations.length === 0) {
        setLocalError(new Error('No consolidation possible with given chunk size'));
        return;
      }

      if (!network?.consolidateAddress) {
        setLocalError(new Error('Network consolidation address not available'));
        return;
      }

      const calls: TransactionCall[] = consolidations.map(({ sourceKey, targetKey }) => ({
        to: network.consolidateAddress,
        data: concat([sourceKey, targetKey]),
        value: parseEther('0.000001'),
      }));

      execute(calls);
    },
    [network, execute]
  );

  const error = localError || txError;

  return {
    consolidateValidators,
    progress,
    isPending,
    isSuccess,
    error
  };
}

export function computeSelfConsolidations(validators: ValidatorInfo[]): Consolidation[] {
  const selfConsolidations: Consolidation[] = [];

  for (const v of validators) {
    selfConsolidations.push({
      sourceIndex: v.index,
      sourceKey: v.pubkey,
      sourceBalance: 1n,
      targetIndex: v.index,
      targetKey: v.pubkey,
      targetBalance: 0n,
    });
  }

  return selfConsolidations;
}
