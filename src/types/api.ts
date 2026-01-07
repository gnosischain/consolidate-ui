import { ValidatorStatus } from "./beacon";
import { FilterStatus } from "./validators";

// API Response types (for JSON serialization)
export interface APIPendingInfo {
    hasPendingWithdrawal: boolean;
    pendingWithdrawalAmount?: string;
    withdrawableEpoch?: string;
    hasPendingDeposit: boolean;
    pendingDepositAmount?: string;
    hasPendingConsolidation: boolean;
    isConsolidationSource: boolean;
    isConsolidationTarget: boolean;
    consolidationTargetIndex?: number;
    consolidationSourceIndex?: number;
}

export interface APIValidatorInfo {
    index: number;
    pubkey: string;
    balance: string; // String for JSON serialization
    effectiveBalance: string; // String for JSON serialization
    withdrawal_credentials: string;
    type: number;
    status: ValidatorStatus;
    filterStatus: FilterStatus;
    pendingInfo?: APIPendingInfo;
}