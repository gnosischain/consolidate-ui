import { Address } from "viem";
import { ValidatorStatus } from "./api";

export interface BeaconChainResponse {
    balance: number;
    index: number;
    status: ValidatorStatus;
    validator: {
        activation_eligibility_epoch: number;
        activation_epoch: number;
        effective_balance: number;
        exit_epoch: number;
        pubkey: Address;
        slashed: boolean;
        withdrawal_epoch: number;
        withdrawal_credentials: Address;
    }
}