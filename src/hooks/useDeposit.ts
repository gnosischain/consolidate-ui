import { useCallback, useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import ERC677ABI from "../utils/abis/erc677";
import { formatUnits, parseUnits } from "viem";
import useBalance from "./useBalance";
import { NetworkConfig } from "../types/network";
import { useClient } from "urql";
import { DepositDataJson } from "../types/deposit";
import { CredentialType } from "../types/validators";
import { generateDepositData, GET_DEPOSIT_EVENTS, getCredentialType } from "../utils/deposit";
import { DEPOSIT_TOKEN_AMOUNT_OLD, MAX_BATCH_DEPOSIT } from "../constants/constants";

export const depositAmountBN = parseUnits("1", 18);

function useDeposit(contractConfig: NetworkConfig, address: `0x${string}`) {
  const [deposits, setDeposits] = useState<DepositDataJson[]>([]);
  const [credentialType, setCredentialType] = useState<CredentialType | undefined>(undefined);
  const [totalDepositAmountBN, setTotalDepositAmountBN] = useState(BigInt(0));
  const { balance, refetchBalance } = useBalance(contractConfig, address);
  const { data: depositHash, error: contractError, writeContract } = useWriteContract();
  const { isSuccess: depositSuccess, error: txError } = useWaitForTransactionReceipt({
    hash: depositHash,
  });
  const client = useClient();

  const validate = useCallback(
    async (deposits: DepositDataJson[], balance: bigint) => {
      let _credentialType: CredentialType | undefined;

      const isValidJson = deposits.every((d) =>
        ["pubkey", "withdrawal_credentials", "amount", "signature", "deposit_message_root", "deposit_data_root", "fork_version"].every((key) => key in d)
      );
      if (!isValidJson) throw Error("Invalid JSON structure.");

      if (!deposits.every((d) => d.fork_version === contractConfig.forkVersion)) {
        throw Error(`File is for the wrong network. Expected: ${contractConfig.chainId}`);
      }

      const pubkeys = deposits.map((d) => `0x${d.pubkey}`);
      const { data } = await client.query(GET_DEPOSIT_EVENTS, {
        pubkeys: pubkeys,
        chainId: contractConfig.chainId,
      });

      const existingDeposits = new Set(
        data.SBCDepositContract_DepositEvent.map((d: { pubkey: string }) => d.pubkey)
      );

      const validDeposits = deposits.filter((d) => !existingDeposits.has(d.pubkey));

      if (validDeposits.length === 0) throw Error("Deposits have already been made to all validators in this file.");

      if (validDeposits.length !== deposits.length) {
        throw Error(
          "Some of the deposits have already been made to the validators in this file."
        );
      }

      const uniquePubkeys = new Set(validDeposits.map((d) => d.pubkey));
      if (uniquePubkeys.size !== validDeposits.length) {
        throw Error("Duplicated public keys detected in the deposit file.");
      }

      _credentialType = getCredentialType(deposits[0].withdrawal_credentials);
      if (!_credentialType) {
        console.log(deposits[0].withdrawal_credentials);
        throw Error("Invalid withdrawal credential type.");
      }

      if (!validDeposits.every((d) => d.withdrawal_credentials.startsWith(_credentialType))) {
        throw Error(`All validators in the file must have the same withdrawal credentials of type ${_credentialType}`);
      }

      if (validDeposits.length > MAX_BATCH_DEPOSIT) {
        throw Error(`Number of validators exceeds the maximum batch size of ${MAX_BATCH_DEPOSIT}. Please upload a file with ${MAX_BATCH_DEPOSIT} or fewer validators.`);
      }

      if ((_credentialType === "00" || _credentialType === "01") && !validDeposits.every((d) => BigInt(d.amount) === BigInt(DEPOSIT_TOKEN_AMOUNT_OLD))) {
        throw Error("Amount should be exactly 32 tokens for deposits.");
      }

      const _totalDepositAmountBN = validDeposits.reduce((sum, d) => sum + BigInt(d.amount), BigInt(0)) * depositAmountBN / BigInt(DEPOSIT_TOKEN_AMOUNT_OLD);

      if (balance < _totalDepositAmountBN) {
        throw Error(`Unsufficient balance. ${Number(formatUnits(_totalDepositAmountBN, 18))} GNO is required.
      `);
      }

      return { deposits: validDeposits, _credentialType, _totalDepositAmountBN };
    },
    [contractConfig, client]
  );

  const setDepositData = useCallback(
    async (file: File) => {
      if (file) {
        let data: DepositDataJson[] = [];
        try {
          data = JSON.parse(await file.text());
        } catch (error) {
          throw Error(
            "Oops, something went wrong while parsing your json file. Please check the file and try again."
          );
        }
        if (balance === undefined) {
          throw Error("Balance not loaded correctly.");
        }
        const { deposits, _credentialType, _totalDepositAmountBN } = await validate(
          data,
          balance
        );
        setDeposits(deposits);
        setCredentialType(_credentialType);
        setTotalDepositAmountBN(_totalDepositAmountBN);
        return _credentialType;
      }
    },
    [validate, balance]
  );

  const deposit = useCallback(async () => {
    if (contractConfig && contractConfig.tokenAddress && contractConfig.depositAddress) {
      const data = generateDepositData(deposits, credentialType === "01" || credentialType === "02");
      writeContract({
        address: contractConfig.tokenAddress,
        abi: ERC677ABI,
        functionName: "transferAndCall",
        args: [
          contractConfig.depositAddress,
          credentialType === '02' || credentialType === "01" ? totalDepositAmountBN : depositAmountBN,
          `0x${data}`,
        ],
      });

      // should move refetchBalance to onDeposit function ?
      refetchBalance();
    }
  }, [contractConfig, credentialType, deposits, refetchBalance, totalDepositAmountBN, writeContract]);

  useEffect(() => {
    if (depositSuccess) {
      refetchBalance();
    }
  }, [depositSuccess, refetchBalance]);

  return {
    deposit,
    depositSuccess,
    contractError,
    txError,
    depositHash,
    depositData: { deposits, credentialType, totalDepositAmountBN },
    setDepositData,
  };
}

export default useDeposit;
