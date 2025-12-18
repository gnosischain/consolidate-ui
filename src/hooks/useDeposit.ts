import { useCallback, useState } from 'react';
import { useReadContract } from 'wagmi';
import { parseGwei, encodeFunctionData } from 'viem';
import useBalance from './useBalance';
import { NetworkConfig } from '../types/network';
import { DepositRequest, DepositDataJson } from '../types/deposit';
import { CredentialType, ValidatorInfo } from '../types/validators';
import { buildDepositRoot, generateDepositData, generateSignature } from '../utils/deposit';
import { validateDepositData } from '../utils/depositValidation';
import { computePartialDepositAmounts } from '../utils/depositCalculations';
import DEPOSIT_ABI from '../utils/abis/deposit';
import ERC677ABI from '../utils/abis/erc677';
import { useTransaction, TransactionCall, UseTransactionOptions } from './useTransaction';

function useDeposit(contractConfig: NetworkConfig, address: `0x${string}`, options?: UseTransactionOptions) {
  const [deposits, setDeposits] = useState<DepositDataJson[]>([]);
  const [credentialType, setCredentialType] = useState<CredentialType | undefined>(undefined);
  const [totalDepositAmount, setTotalDepositAmount] = useState<bigint>(0n);
  const [validationError, setValidationError] = useState<Error | null>(null);
  const { balance, refetchBalance } = useBalance(contractConfig, address);

  const {
    execute,
    isPending,
  } = useTransaction({
    ...options, onSuccess: () => {
      refetchBalance();
      refetchAllowance();
    }
  });

  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (!graphqlUrl) {
    throw new Error('Environment variable NEXT_PUBLIC_GRAPHQL_URL is not defined');
  }

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contractConfig?.tokenAddress,
    abi: ERC677ABI,
    functionName: "allowance",
    args: contractConfig?.tokenAddress && contractConfig?.depositAddress ? [address, contractConfig.depositAddress] : undefined,
  });

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
          throw new Error('Balance not loaded correctly.');
        }

        const { deposits, credentialType, totalDepositAmount } = await validateDepositData(
          data,
          balance,
          contractConfig,
          graphqlUrl
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
    [balance, contractConfig, graphqlUrl]
  );

  // Helper to build approve call
  const buildApproveCall = useCallback(
    (amount: bigint): TransactionCall => {
      const callData = encodeFunctionData({
        abi: ERC677ABI,
        functionName: 'approve',
        args: [contractConfig.depositAddress!, amount],
      });
      return {
        to: contractConfig.tokenAddress!,
        data: callData,
        title: 'Approve GNO',
      };
    },
    [contractConfig]
  );

  // Helper to build deposit call from deposit data
  const buildDepositCall = useCallback(
    (depositData: ReturnType<typeof generateDepositData>): TransactionCall => {
      const callData = encodeFunctionData({
        abi: DEPOSIT_ABI,
        functionName: 'batchDeposit',
        args: [
          depositData.pubkeys,
          depositData.withdrawal_credentials,
          depositData.signatures,
          depositData.deposit_data_roots,
          depositData.amounts,
        ],
      });
      return {
        to: contractConfig.depositAddress!,
        data: callData,
        title: 'Deposit GNO to contract',
      };
    },
    [contractConfig]
  );

  const deposit = useCallback(async () => {
    if (!contractConfig?.tokenAddress || !contractConfig?.depositAddress) return;

    const depositsFormatted = deposits.map((d) => ({
      ...d,
      amount: BigInt(parseGwei(d.amount.toString()) / contractConfig.cl.multiplier),
    }));
    const data = generateDepositData(depositsFormatted);
    const depositCall = buildDepositCall(data);

    const calls: TransactionCall[] = [];

    // Add approve if needed
    if ((allowance || 0n) < totalDepositAmount) {
      calls.push(buildApproveCall(totalDepositAmount));
    }

    calls.push(depositCall);
    execute(calls);
  }, [contractConfig, deposits, totalDepositAmount, allowance, buildApproveCall, buildDepositCall, execute]);

  const partialDeposit = useCallback(
    async (amounts: bigint[], validators: ValidatorInfo[]) => {
      if (!contractConfig?.tokenAddress || !contractConfig?.depositAddress) return;

      const depositsData = validators.map((validator, index) => {
        const depositReq: DepositRequest = {
          pubkey: validator.pubkey as `0x${string}`,
          withdrawal_credentials: validator.withdrawal_credentials as `0x${string}`,
          signature: generateSignature(96),
          amount: amounts[index],
        };

        const deposit_data_root = buildDepositRoot(
          depositReq.pubkey,
          depositReq.withdrawal_credentials,
          depositReq.signature,
          depositReq.amount
        );

        return {
          ...depositReq,
          amount: depositReq.amount,
          pubkey: validator.pubkey.replace('0x', ''),
          signature: depositReq.signature.replace('0x', ''),
          deposit_data_root: deposit_data_root.replace('0x', ''),
          withdrawal_credentials: validator.withdrawal_credentials.replace('0x', ''),
          deposit_message_root: '0x0000000000000000000000000000000000000000000000000000000000000000',
          fork_version: contractConfig.forkVersion,
        };
      });

      const data = generateDepositData(depositsData);
      const depositCall = buildDepositCall(data);

      const totalAmount = amounts.reduce((acc, amt) => acc + amt, 0n);
      const calls: TransactionCall[] = [];

      // Add approve if needed
      if ((allowance || 0n) < totalAmount) {
        calls.push(buildApproveCall(totalAmount));
      }

      calls.push(depositCall);
      execute(calls);
    },
    [contractConfig, allowance, buildApproveCall, buildDepositCall, execute]
  );

  const error = validationError || null;

  return {
    deposit,
    partialDeposit,
    computePartialDepositAmounts,
    isPending,
    error,
    depositData: { deposits, credentialType, totalDepositAmount },
    setDepositData,
    allowance: allowance || 0n,
  };
}

export default useDeposit;
