import { Address } from "viem";
import { ValidatorStatus } from "./api";

export enum FilterStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    EXITED = "exited",
}

export interface ValidatorInfo {
    index: number;
    pubkey: Address;
    balanceEth: number;
    withdrawal_credentials: Address;
    type: 0 | 1 | 2;
    status?: ValidatorStatus;
    filterStatus?: FilterStatus;
}

export interface ValidatorIndex {
    pubkey: Address;
    index: number;
}