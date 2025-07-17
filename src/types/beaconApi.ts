import { ValidatorStatus } from "./beacon";
import { Address } from "viem";

export interface BeaconApiValidatorDetailsResponse {
    activationeligibilityepoch: number;
    activationepoch: number;
    balance: number;
    // in gwei
    effectivebalance: number;
    exitepoch: number;
    lastattestationslot: number;
    name: string;
    pubkey: string;
    slashed: boolean;
    status: ValidatorStatus;
    total_withdrawals: number;
    validatorindex: number;
    withdrawalepoch: number;
    withdrawalcredentials: string;
}

export interface BeaconApiValidatorsResponse {
    publickey: Address;
    validatorindex: number;
}