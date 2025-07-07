import { ValidatorStatus } from "./beacon";

export interface APIValidatorDetailsResponse {
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

export interface APIValidatorsResponse {
    publickey: string;
    validatorindex: number;
}