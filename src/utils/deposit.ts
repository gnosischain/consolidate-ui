import { concat, parseGwei, sha256, toBytes, toHex } from "viem";
import { BatchDepositData, DepositDataJson, DepositRequest } from "../types/deposit";
import { CredentialType } from "../types/validators";

export const generateDepositData = (deposits: DepositDataJson[]): BatchDepositData => {
  console.log(deposits);
  const pubkeys = `0x${deposits.map(d => d.pubkey).join("")}` as `0x${string}`;
  const withdrawal_credentials = `0x${deposits[0].withdrawal_credentials}` as `0x${string}`;
  const signatures = `0x${deposits.map(d => d.signature).join("")}` as `0x${string}`;
  const deposit_data_roots = deposits.map(d => `0x${d.deposit_data_root}` as `0x${string}`);
  const amounts = deposits.map(d => parseGwei(d.amount.toString()) / 32n);

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

export function formatDepositDataRoot(deposit: DepositRequest): `0x${string}` {
  // 1) amount in gwei, as 8‐byte LE
  const amountGwei = deposit.amount / BigInt(1e9);
  const amountLe = toLittleEndian64(amountGwei);
  const amountLeHex = toHex(amountLe);

  // pre‐compute some zero pads
  const zeros16Hex = toHex(new Uint8Array(16)); // 16 zero bytes
  const zeros24Hex = toHex(new Uint8Array(24)); // 24 zero bytes
  const zeros32Hex = toHex(new Uint8Array(32)); // 32 zero bytes

  // 2) pubKeyRoot = SHA256(pubkey || 16 zero bytes)
  const pubKeyRootHex = sha256(
    concat([ deposit.pubkey, zeros16Hex ])
  );

  // 3) signatureRoot =
  //    SHA256(
  //      SHA256(sig[0:64]) ||
  //      SHA256(sig[64:96] || 32 zero bytes)
  //    )
  const sig = deposit.signature;
  const sigPart1 = `0x${sig.slice(2, 2 + 64 * 2)}`;    // first 64 bytes
  const sigPart2 = `0x${sig.slice(2 + 64 * 2)}`;        // last 32 bytes
  const sigHash1Hex = sha256(sigPart1 as `0x${string}`);
  const sigHash2Hex = sha256(concat([ sigPart2 as `0x${string}`, zeros32Hex ]));
  const signatureRootHex = sha256(concat([ sigHash1Hex, sigHash2Hex ]));

  // 4a) subtreeA = SHA256(pubKeyRoot || withdrawal_credentials)
  const subtreeAHex = sha256(
    concat([ pubKeyRootHex, deposit.withdrawal_credentials ])
  );

  // 4b) subtreeB = SHA256(amountLE || 24 zero bytes || signatureRoot)
  const subtreeBHex = sha256(
    concat([ amountLeHex, zeros24Hex, signatureRootHex ])
  );

  // 5) final root = SHA256(subtreeA || subtreeB)
  const rootHex = sha256(concat([ subtreeAHex, subtreeBHex ]));
  return rootHex;
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

export const GET_DEPOSIT_EVENTS = `
query MyQuery($pubkeys: [String!], $chainId: Int!) {
  SBCDepositContract_DepositEvent(
    where: { 
      pubkey: { 
        _in: $pubkeys
      },
      chainId: {_eq: $chainId}
    }
  ) {
    id
    amount
    db_write_timestamp
    index
    withdrawal_credentials
    pubkey
  }
}
`;
