import { Address } from "viem";
import { ValidatorStatus } from "./api";

export enum FilterStatus {
    ACTIVE = "active",
    PENDING = "pending",
    EXITED = "exited",
}

export interface ValidatorInfo {
    index: number;
    pubkey: Address;
    balanceEth: number;
    withdrawal_credentials: Address;
    type: number;
    status: ValidatorStatus;
    filterStatus: FilterStatus;
}

export interface ValidatorIndex {
    pubkey: Address;
    index: number;
}

export interface Withdrawal {
	pubkey: Address;
	amount: number;
}