import { Address } from 'viem';
import { APIValidatorInfo } from '../types/api';
import { ValidatorInfo, FilterStatus, ValidatorPendingInfo } from '../types/validators';

/**
 * Convert API response ValidatorInfo to domain ValidatorInfo
 */
export function apiToValidatorInfo(apiValidator: APIValidatorInfo): ValidatorInfo {
  const pendingInfo: ValidatorPendingInfo | undefined = apiValidator.pendingInfo
    ? {
        hasPendingWithdrawal: apiValidator.pendingInfo.hasPendingWithdrawal,
        pendingWithdrawalAmount: apiValidator.pendingInfo.pendingWithdrawalAmount
          ? BigInt(apiValidator.pendingInfo.pendingWithdrawalAmount)
          : undefined,
        withdrawableEpoch: apiValidator.pendingInfo.withdrawableEpoch,
        hasPendingDeposit: apiValidator.pendingInfo.hasPendingDeposit,
        pendingDepositAmount: apiValidator.pendingInfo.pendingDepositAmount
          ? BigInt(apiValidator.pendingInfo.pendingDepositAmount)
          : undefined,
        hasPendingConsolidation: apiValidator.pendingInfo.hasPendingConsolidation,
        isConsolidationSource: apiValidator.pendingInfo.isConsolidationSource,
        isConsolidationTarget: apiValidator.pendingInfo.isConsolidationTarget,
        consolidationTargetIndex: apiValidator.pendingInfo.consolidationTargetIndex,
        consolidationSourceIndex: apiValidator.pendingInfo.consolidationSourceIndex,
      }
    : undefined;

  return {
    index: apiValidator.index,
    pubkey: apiValidator.pubkey as Address,
    balance: BigInt(apiValidator.balance),
    effectiveBalance: BigInt(apiValidator.effectiveBalance),
    withdrawal_credentials: apiValidator.withdrawal_credentials as Address,
    type: apiValidator.type as 0 | 1 | 2,
    status: apiValidator.status,
    filterStatus: apiValidator.filterStatus as FilterStatus,
    pendingInfo,
  };
}