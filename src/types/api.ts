export const VALIDATOR_STATUS = [
  'pending_initialized',
  'pending_queued',
  'active_ongoing',
  'active_online',
  'active_offline',
  'active_exiting',
  'active_slashed',
  'exited_unslashed',
  'exited',
  'exited_slashed',
  'withdrawal_possible',
  'withdrawal_done',
] as const

export type ValidatorStatus =
  typeof VALIDATOR_STATUS[number]

export interface APIValidatorDetailsResponse {
    activationeligibilityepoch: number;
    activationepoch: number;
    balance: number;
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