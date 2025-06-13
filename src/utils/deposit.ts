import { DepositDataJson } from "../types/deposit";
import { CredentialType } from "../types/validators";

export const generateDepositData = (deposits: DepositDataJson[], isBatch: boolean): string => {
  let data = "";
  if (isBatch) {
    data += deposits[0].withdrawal_credentials;
    deposits.forEach((deposit) => {
      data += deposit.pubkey;
      data += deposit.signature;
      data += deposit.deposit_data_root;
    });
  } else {
    deposits.forEach((deposit) => {
      data += deposit.withdrawal_credentials;
      data += deposit.pubkey;
      data += deposit.signature;
      data += deposit.deposit_data_root;
    });
  }
  return data;
};

export const getCredentialType = (withdrawalCredential: string): CredentialType | undefined => {
  if (withdrawalCredential.startsWith("00")) {
    return "00";
  }
  if (withdrawalCredential.startsWith("01")) {
    return "01";
  }
  if (withdrawalCredential.startsWith("02")) {
    return "02";
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
