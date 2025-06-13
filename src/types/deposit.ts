export interface DepositDataJson {
    pubkey: string;
    withdrawal_credentials: string;
    amount: bigint;
    signature: string;
    deposit_message_root: string;
    deposit_data_root: string;
    fork_version: string;
}