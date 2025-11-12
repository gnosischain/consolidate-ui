import { concat, sha256, toHex } from "viem";
import { BatchDepositData, DepositDataJson } from "../types/deposit";
import { CredentialType } from "../types/validators";

export const generateDepositData = (deposits: DepositDataJson[]): BatchDepositData => {
  const pubkeys = `0x${deposits.map(d => d.pubkey).join("")}` as `0x${string}`;
  const withdrawal_credentials = `0x${deposits[0].withdrawal_credentials}` as `0x${string}`;
  const signatures = `0x${deposits.map(d => d.signature).join("")}` as `0x${string}`;
  const deposit_data_roots = deposits.map(d => `0x${d.deposit_data_root}` as `0x${string}`);
  const amounts = deposits.map(d => d.amount);

  return {
    pubkeys,
    withdrawal_credentials,
    signatures,
    deposit_data_roots,
    amounts
  };
};

export function generateSignature(length: number): `0x${string}` {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `0x${hex}`;
}

function toLittleEndian64(value: bigint): Uint8Array {
  const buf = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    buf[i] = Number((value >> BigInt(8 * i)) & BigInt(0xff));
  }
  return buf;
}

export function buildDepositRoot(
  pubkey: `0x${string}`,
  withdrawalCreds: `0x${string}`,
  signature: `0x${string}`,
  stakeAmountWei: bigint               // the value you pass to the contract
): `0x${string}` {

  const amountGwei = stakeAmountWei * 32n / 10n ** 9n;
  const amountLE = toLittleEndian64(amountGwei);

  const pubkeyRoot = sha256(concat([pubkey, `0x${"00".repeat(16)}`]));
  const sigPart1 = signature.slice(0, 2 + 64 * 2);        // 64 bytes
  const sigPart2 = signature.slice(2 + 64 * 2);           // 32 bytes

  const sigHash1 = sha256(sigPart1 as `0x${string}`);
  const sigHash2 = sha256(concat([`0x${sigPart2}`, `0x${"00".repeat(32)}`]));
  const signatureRoot = sha256(concat([sigHash1, sigHash2]));

  const subtreeA = sha256(concat([pubkeyRoot, withdrawalCreds]));
  const subtreeB = sha256(concat([toHex(amountLE), `0x${"00".repeat(24)}`, signatureRoot]));

  return sha256(concat([subtreeA, subtreeB]));
}

export const getCredentialType = (withdrawalCredential: string): CredentialType | undefined => {

  if (withdrawalCredential.startsWith("00")) {
    return 0;
  }
  if (withdrawalCredential.startsWith("01")) {
    return 1;
  }
  if (withdrawalCredential.startsWith("02")) {
    return 2;
  }
  return undefined;
};
