import { Address } from 'viem';
import { APIValidatorInfo } from '../types/api';
import { ValidatorInfo, FilterStatus } from '../types/validators';

/**
 * Convert API response ValidatorInfo to domain ValidatorInfo
 */
export function apiToValidatorInfo(apiValidator: APIValidatorInfo): ValidatorInfo {
  return {
    index: apiValidator.index,
    pubkey: apiValidator.pubkey as Address,
    balance: BigInt(apiValidator.balance), // Convert string back to BigInt
    effectiveBalance: BigInt(apiValidator.effectiveBalance), // Convert string back to BigInt
    withdrawal_credentials: apiValidator.withdrawal_credentials as Address,
    type: apiValidator.type as 0 | 1 | 2,
    status: apiValidator.status,
    filterStatus: apiValidator.filterStatus as FilterStatus,
  };
}