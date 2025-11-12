import { useCallback, useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseGwei } from "viem";
import useBalance from "./useBalance";
import { NetworkConfig } from "../types/network";
import { useClient } from "urql";
import { DepositRequest, DepositDataJson } from "../types/deposit";
import { CredentialType, ValidatorInfo } from "../types/validators";
import { buildDepositRoot, generateDepositData, generateSignature } from "../utils/deposit";
import { validateDepositData } from "../utils/depositValidation";
import { computePartialDepositAmounts } from "../utils/depositCalculations";
import DEPOSIT_ABI from "../utils/abis/deposit";
import ERC677ABI from "../utils/abis/erc677";

function useDeposit(contractConfig: NetworkConfig, address: `0x${string}`) {
  const [deposits, setDeposits] = useState<DepositDataJson[]>([]);
  const [credentialType, setCredentialType] = useState<CredentialType | undefined>(undefined);
  const [totalDepositAmount, setTotalDepositAmount] = useState<bigint>(0n);
  const [validationError, setValidationError] = useState<Error | null>(null);
  
  const { balance, refetchBalance } = useBalance(contractConfig, address);
  const { data: approveHash, error: approveContractError, writeContract: writeApproveContract } = useWriteContract();
  const { data: depositHash, error: depositContractError, writeContract: writeDepositContract } = useWriteContract();
  
  const { isSuccess: approveSuccess, isLoading: approveLoading, error: approveTxError } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  const { isSuccess: depositSuccess, isLoading: depositLoading, error: depositTxError } = useWaitForTransactionReceipt({
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
      setIsApproved(allowance >= requiredAmount);
    } else {
      setIsApproved(false);
    }
  }, [allowance, totalDepositAmount, contractConfig?.cl?.multiplier]);


  const setDepositData = useCallback(
    async (file: File) => {
      setValidationError(null);
      
      if (!file) return;

      try {
        let data: DepositDataJson[] = [];
        try {
          data = JSON.parse(await file.text());
        } catch (error) {
          throw new Error(`Failed to parse JSON file. Please check the file format. ${error}`);
        }

        if (balance === undefined) {
          throw new Error("Balance not loaded correctly.");
        }

        const { deposits, credentialType, totalDepositAmount } = await validateDepositData(
          data,
          balance,
          contractConfig,
          client
        );

        setDeposits(deposits);
        setCredentialType(credentialType);
        setTotalDepositAmount(totalDepositAmount);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setValidationError(err);
        setDeposits([]);
        setCredentialType(undefined);
        setTotalDepositAmount(0n);
      }
    },
    [balance, contractConfig, client]
  );

  const deposit = useCallback(async () => {
    if (contractConfig && contractConfig.tokenAddress && contractConfig.depositAddress) {
      const depositsFormatted = deposits.map(d => ({
        ...d,
        amount: BigInt(parseGwei(d.amount.toString()) / contractConfig.cl.multiplier),
      }));
      const data = generateDepositData(depositsFormatted);
      
      writeDepositContract({
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
    }
  }, [contractConfig, deposits, writeDepositContract]);

  const partialDeposit = useCallback(async (amounts: bigint[], validators: ValidatorInfo[]) => {
    if (contractConfig && contractConfig.tokenAddress && contractConfig.depositAddress) {
      const deposits = validators.map((validator, index) => {
        const deposit: DepositRequest = {
          pubkey: validator.pubkey as `0x${string}`,
          withdrawal_credentials: validator.withdrawal_credentials as `0x${string}`,
          signature: generateSignature(96),
          amount: amounts[index],
        };

        const deposit_data_root = buildDepositRoot(
          deposit.pubkey, 
          deposit.withdrawal_credentials, 
          deposit.signature, 
          deposit.amount
        );

        return {
          ...deposit,
          amount: deposit.amount,
          pubkey: validator.pubkey.replace("0x", ""),
          signature: deposit.signature.replace("0x", ""),
          deposit_data_root: deposit_data_root.replace("0x", ""),
          withdrawal_credentials: validator.withdrawal_credentials.replace("0x", ""),
          deposit_message_root: "0x0000000000000000000000000000000000000000000000000000000000000000",
          fork_version: contractConfig.forkVersion,
        };
      });

      const data = generateDepositData(deposits);

      writeDepositContract({
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
    }
  }, [contractConfig, writeDepositContract]);


  const approve = useCallback(async (amount: bigint) => {
    if (contractConfig && contractConfig.tokenAddress && contractConfig.depositAddress) {
      writeApproveContract({
        address: contractConfig.tokenAddress,
        abi: ERC677ABI,
        functionName: "approve",
        args: [contractConfig.depositAddress, amount],
      });
    }
  }, [contractConfig, writeApproveContract]);

  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance();
    }
  }, [approveSuccess, refetchAllowance]);

  useEffect(() => {
    if (depositSuccess) {
      refetchBalance();
      refetchAllowance();
    }
  }, [depositSuccess, refetchBalance, refetchAllowance]);

  // Combine all errors
  const error = validationError || approveContractError || depositContractError || approveTxError || depositTxError || null;

  return {
    deposit,
    partialDeposit,
    computePartialDepositAmounts,
    approveSuccess,
    approveLoading,
    depositSuccess,
    depositLoading,
    error,
    depositHash,
    depositData: { deposits, credentialType, totalDepositAmount },
    setDepositData,
    approve,
    isApproved,
  };
}

export default useDeposit;
