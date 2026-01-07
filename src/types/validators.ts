import { Address } from "viem";
import { ValidatorStatus } from "./beacon";

export enum FilterStatus {
    ACTIVE = "active",
    PENDING = "pending",
    EXITED = "exited",
}

export type CredentialType = 0 | 1 | 2;

export interface ValidatorPendingInfo {
	hasPendingWithdrawal: boolean;
	pendingWithdrawalAmount?: bigint;
	withdrawableEpoch?: string;
	hasPendingDeposit: boolean;
	pendingDepositAmount?: bigint;
	hasPendingConsolidation: boolean;
	isConsolidationSource: boolean;
	isConsolidationTarget: boolean;
	consolidationTargetIndex?: number;
	consolidationSourceIndex?: number;
}

export interface ValidatorInfo {
    index: number;
    pubkey: Address;
    balance: bigint;
    effectiveBalance: bigint;
    withdrawal_credentials: Address;
    type: CredentialType;
    status: ValidatorStatus;
    filterStatus: FilterStatus;
    pendingInfo?: ValidatorPendingInfo;
}

export interface ValidatorIndex {
    pubkey: Address;
    index: number;
}

export interface Withdrawal {
	pubkey: Address;
	amount: bigint;
}

export interface Consolidation {
	sourceIndex: number;
	sourceKey: Address;
	sourceBalance: bigint;
	targetIndex: number;
	targetKey: Address;
	targetBalance: bigint;
}
