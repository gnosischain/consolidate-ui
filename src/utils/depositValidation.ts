import { formatEther, parseGwei } from "viem";
import { NetworkConfig } from "../types/network";
import { DepositDataJson } from "../types/deposit";
import { CredentialType } from "../types/validators";
import { getCredentialType } from "./deposit";
import { Client } from "urql";

export interface ValidationResult {
  deposits: DepositDataJson[];
  credentialType: CredentialType;
  totalDepositAmount: bigint;
}

export const GET_DEPOSIT_EVENTS = `
  query GetDepositEvents($pubkeys: [String!]!, $chainId: Int!) {
    SBCDepositContract_DepositEvent(
      where: { pubkey: { _in: $pubkeys }, chainId: { _eq: $chainId } }
    ) {
      pubkey
    }
  }
`;

/**
 * Validates deposit data from a JSON file
 * @throws Error if validation fails
 */
export async function validateDepositData(
  deposits: DepositDataJson[],
  balance: bigint,
  contractConfig: NetworkConfig,
  client: Client
): Promise<ValidationResult> {
  // Validate JSON structure
  const isValidJson = deposits.every((d) =>
    ["pubkey", "withdrawal_credentials", "amount", "signature", "deposit_message_root", "deposit_data_root", "fork_version"].every((key) => key in d)
  );
  if (!isValidJson) {
    throw new Error("Invalid JSON structure.");
  }

  // Validate fork version
  if (!deposits.every((d) => d.fork_version === contractConfig.forkVersion)) {
    throw new Error(`File is for the wrong network. Expected: ${contractConfig.chainId}`);
  }

  // Check for existing deposits
  const pubkeys = deposits.map((d) => `0x${d.pubkey}`);
  const { data, error } = await client.query(GET_DEPOSIT_EVENTS, {
    pubkeys: pubkeys,
    chainId: contractConfig.chainId,
  });

  if (error) {
    console.error(error, pubkeys);
    throw new Error(`Failed to fetch existing deposits: ${error.message}`);
  }

  if (!data || !data.SBCDepositContract_DepositEvent) {
    throw new Error("Invalid response from deposit query");
  }

  const existingDeposits = new Set(
    data.SBCDepositContract_DepositEvent.map((d: { pubkey: string }) => d.pubkey)
  );

  const validDeposits: DepositDataJson[] = deposits.filter((d) => !existingDeposits.has('0x' + d.pubkey));

  if (validDeposits.length === 0) {
    throw new Error("Deposits have already been made to all validators in this file.");
  }

  if (validDeposits.length !== deposits.length) {
    throw new Error(
      "Some of the deposits have already been made to the validators in this file."
    );
  }

  // Check for duplicate pubkeys
  const uniquePubkeys = new Set(validDeposits.map((d) => d.pubkey));
  if (uniquePubkeys.size !== validDeposits.length) {
    throw new Error("Duplicated public keys detected in the deposit file.");
  }

  // Validate withdrawal credentials
  const credentials = deposits[0].withdrawal_credentials;
  const credentialType = getCredentialType(credentials);

  if (!validDeposits.every((d) => d.withdrawal_credentials === credentials)) {
    throw new Error("All validators in the file must have the same withdrawal credentials.");
  }

  // Validate balance
  const totalDepositAmount = validDeposits.reduce((acc, deposit) => acc + parseGwei(deposit.amount.toString()) / 32n, 0n);

  if (balance < totalDepositAmount) {
    throw new Error(`Insufficient balance. ${formatEther(totalDepositAmount)} GNO is required.`);
  }

  if (!credentialType) {
    throw new Error("Invalid withdrawal credentials.");
  }

  return { deposits: validDeposits, credentialType, totalDepositAmount };
}

