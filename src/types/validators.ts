import { Address } from "viem";
import { ValidatorStatus } from "./api";

export enum FilterStatus {
    ACTIVE = "active",
    PENDING = "pending",
    EXITED = "exited",
}

export type CredentialType = 0 | 1 | 2;

export interface ValidatorInfo {
    index: number;
    pubkey: Address;
    balanceEth: bigint;
    withdrawal_credentials: Address;
    type: CredentialType;
    status: ValidatorStatus;
    filterStatus: FilterStatus;
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