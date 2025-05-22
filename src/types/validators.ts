import { Address } from "viem";


export interface ValidatorInfo {
    index: number;
    pubkey: Address;
    balanceEth: number;
    withdrawal_credentials: Address;
    type: number;
    status?: string;
}

export interface ValidatorIndex {
    pubkey: Address;
    index: number;
}