import { useCallback, useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { formatEther, parseGwei } from "viem";
import useBalance from "./useBalance";
import { NetworkConfig } from "../types/network";
import { useClient } from "urql";
import { DepositDataJson } from "../types/deposit";
import { CredentialType } from "../types/validators";
import { generateDepositData, GET_DEPOSIT_EVENTS, getCredentialType } from "../utils/deposit";
import DEPOSIT_ABI from "../utils/abis/deposit";
import ERC677ABI from "../utils/abis/erc677";

function useDeposit(contractConfig: NetworkConfig, address: `0x${string}`, isPartialDeposit: boolean = false, pubkey?: string) {
  const [deposits, setDeposits] = useState<DepositDataJson[]>([]);
  const [credentialType, setCredentialType] = useState<CredentialType | undefined>(undefined);
  const [totalDepositAmount, setTotalDepositAmount] = useState<bigint>(0n);
  const { balance, refetchBalance } = useBalance(contractConfig, address);
  const { data: depositHash, error: contractError, writeContract } = useWriteContract();
  const { isSuccess: depositSuccess, error: txError } = useWaitForTransactionReceipt({
    hash: depositHash,
  });
  const client = useClient();
  const [isApproved, setIsApproved] = useState(false);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contractConfig?.tokenAddress,
    abi: ERC677ABI,
    functionName: "allowance",
    args: contractConfig?.tokenAddress && contractConfig?.depositAddress ? [address, contractConfig.depositAddress] : undefined,
  });

  useEffect(() => {
    if (allowance && totalDepositAmount > 0n && contractConfig?.cl?.multiplier) {
      const requiredAmount = totalDepositAmount;
      console.log(allowance, requiredAmount, totalDepositAmount);
      setIsApproved(allowance >= requiredAmount);
    } else {
      setIsApproved(false);
    }
  }, [allowance, totalDepositAmount, contractConfig?.cl?.multiplier]);

  const validate = useCallback(
    async (deposits: DepositDataJson[], balance: bigint) => {

      const isValidJson = deposits.every((d) =>
        ["pubkey", "withdrawal_credentials", "amount", "signature", "deposit_message_root", "deposit_data_root", "fork_version"].every((key) => key in d)
      );
      if (!isValidJson) throw Error("Invalid JSON structure.");

      if (!deposits.every((d) => d.fork_version === contractConfig.forkVersion)) {
        throw Error(`File is for the wrong network. Expected: ${contractConfig.chainId}`);
      }

      // Partial deposit specific validation
      if (isPartialDeposit) {
        if (deposits.length !== 1) {
          throw Error("Partial deposit files must contain exactly one validator.");
        }
      }

      const pubkeys = deposits.map((d) => `0x${d.pubkey}`);
      const { data, error } = await client.query(GET_DEPOSIT_EVENTS, {
        pubkeys: pubkeys,
        chainId: contractConfig.chainId,
      });

      if (error) {
        throw Error(`Failed to fetch existing deposits: ${error.message}`);
      }

      if (!data || !data.SBCDepositContract_DepositEvent) {
        throw Error("Invalid response from deposit query");
      }

      const existingDeposits = new Set(
        data.SBCDepositContract_DepositEvent.map((d: { pubkey: string }) => d.pubkey)
      );

      let validDeposits: DepositDataJson[];

      if (isPartialDeposit) {
        const hasExistingDeposit = existingDeposits.has('0x' + deposits[0].pubkey);
        if (pubkey && pubkey.replace(/^0x/, '') !== deposits[0].pubkey) {
          throw Error(`Validator ${pubkey.replace(/^0x/, '')} does not match ${deposits[0].pubkey}.`);
        }
        if (!hasExistingDeposit) {
          throw Error("Cannot make partial deposit: No existing deposit found for this validator. Use regular deposit for new validators.");
        }
        validDeposits = deposits;
      } else {
        validDeposits = deposits.filter((d) => !existingDeposits.has('0x' + d.pubkey));

        if (validDeposits.length === 0) throw Error("Deposits have already been made to all validators in this file.");

        if (validDeposits.length !== deposits.length) {
          throw Error(
            "Some of the deposits have already been made to the validators in this file."
          );
        }
      }

      const uniquePubkeys = new Set(validDeposits.map((d) => d.pubkey));
      if (uniquePubkeys.size !== validDeposits.length) {
        throw Error("Duplicated public keys detected in the deposit file.");
      }

      const credentials = deposits[0].withdrawal_credentials;
      const credentialType = getCredentialType(credentials);

      if (!validDeposits.every((d) => d.withdrawal_credentials === credentials)) {
        throw Error("All validators in the file must have the same withdrawal credentials.");
      }

      const _totalDepositAmount = validDeposits.reduce((acc, deposit) => acc + parseGwei(deposit.amount.toString()) / 32n, 0n);

      if (balance < _totalDepositAmount) {
        throw Error(`Unsufficient balance. ${formatEther(_totalDepositAmount)} GNO is required.
      `);
      }

      return { deposits: validDeposits, credentialType, _totalDepositAmount };
    },
    [contractConfig, client, isPartialDeposit, pubkey]
  );

  const setDepositData = useCallback(
    async (file: File) => {
      if (file) {
        let data: DepositDataJson[] = [];
        try {
          data = JSON.parse(await file.text());
        } catch (error) {
          throw new Error(`Oops, something went wrong while parsing your json file. Please check the file and try again. ${error}`);
        }
        if (balance === undefined) {
          throw Error("Balance not loaded correctly.");
        }
        const { deposits, credentialType, _totalDepositAmount } = await validate(
          data,
          balance
        );
        setDeposits(deposits);
        setCredentialType(credentialType);
        setTotalDepositAmount(_totalDepositAmount);
      }
    },
    [validate, balance]
  );

  const deposit = useCallback(async () => {
    if (contractConfig && contractConfig.tokenAddress && contractConfig.depositAddress) {
      const data = generateDepositData(deposits);
      console.log(data);
      writeContract({
        address: contractConfig.depositAddress,
        abi: DEPOSIT_ABI,
        functionName: "batchDeposit",
        args: [
          data.pubkeys,
          data.withdrawal_credentials,
          data.signatures,
          data.deposit_data_roots,
          data.amounts,
        ],
      });

      // should move refetchBalance to onDeposit function ?
      refetchBalance();
    }
  }, [contractConfig, deposits, refetchBalance, writeContract]);

  const approve = useCallback(async (amount: bigint) => {
    if (contractConfig && contractConfig.tokenAddress && contractConfig.depositAddress) {
      writeContract({
        address: contractConfig.tokenAddress,
        abi: ERC677ABI,
        functionName: "approve",
        args: [contractConfig.depositAddress, amount],
      });
    }
  }, [contractConfig, writeContract]);

  useEffect(() => {
    if (depositSuccess) {
      refetchBalance();
      refetchAllowance();
    }
  }, [depositSuccess, refetchBalance, refetchAllowance]);

  return {
    deposit,
    depositSuccess,
    contractError,
    txError,
    depositHash,
    depositData: { deposits, credentialType, totalDepositAmount },
    setDepositData,
    approve,
    isApproved,
  };
}

export default useDeposit;
