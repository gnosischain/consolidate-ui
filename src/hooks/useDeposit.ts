import { useCallback, useMemo, useState } from 'react';
import { useReadContract } from 'wagmi';
import { parseGwei, encodeFunctionData } from 'viem';
import useBalance from './useBalance';
import { NetworkConfig } from '../types/network';
import { DepositRequest, DepositDataJson } from '../types/deposit';
import { CredentialType, ValidatorInfo } from '../types/validators';
import { buildDepositRoot, generateDepositData, generateSignature } from '../utils/deposit';
import DEPOSIT_ABI from '../utils/abis/deposit';
import ERC677ABI from '../utils/abis/erc677';
import { TransactionCall } from '../types/transaction';

function useDeposit(contractConfig: NetworkConfig, address: `0x${string}`) {
	const [deposits, setDeposits] = useState<DepositDataJson[]>([]);
	const [credentialType, setCredentialType] = useState<CredentialType | undefined>(undefined);
	const [totalDepositAmount, setTotalDepositAmount] = useState<bigint>(0n);
	const [validationError, setValidationError] = useState<Error | null>(null);
	const { balance, refetchBalance } = useBalance(contractConfig, address);

	const { data: allowance, refetch: refetchAllowance } = useReadContract({
		address: contractConfig?.tokenAddress,
		abi: ERC677ABI,
		functionName: 'allowance',
		args:
			contractConfig?.tokenAddress && contractConfig?.depositAddress
				? [address, contractConfig.depositAddress]
				: undefined,
	});

	const setDepositData = useCallback(
		async (file: File) => {
			setValidationError(null);

			if (!file) return;

			try {
				let parsedData: DepositDataJson[] = [];
				try {
					parsedData = JSON.parse(await file.text());
				} catch (error) {
					throw new Error(`Failed to parse JSON file. Please check the file format. ${error}`);
				}

				if (balance === undefined) {
					throw new Error('Balance not loaded correctly.');
				}

				const response = await fetch('/api/validate-deposit', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						depositDataJson: parsedData,
						balance: balance.toString(),
						chainId: contractConfig.chainId,
					}),
				});

				if (!response.ok) {
					const errData = await response.json();
					throw new Error(errData.error || 'Validation failed on server');
				}

				const { data } = await response.json();

				setDeposits(data.deposits);
				setCredentialType(data.credentialType);
				setTotalDepositAmount(BigInt(data.totalDepositAmount));
			} catch (error) {
				const err = error instanceof Error ? error : new Error(String(error));
				setValidationError(err);
				setDeposits([]);
				setCredentialType(undefined);
				setTotalDepositAmount(0n);
			}
		},
		[balance, contractConfig],
	);

	const buildApproveCall = useCallback(
		(amount: bigint): TransactionCall => ({
			to: contractConfig.tokenAddress!,
			data: encodeFunctionData({
				abi: ERC677ABI,
				functionName: 'approve',
				args: [contractConfig.depositAddress!, amount],
			}),
			title: 'Approve GNO',
		}),
		[contractConfig],
	);

	const buildDepositCall = useCallback(
		(depositData: ReturnType<typeof generateDepositData>): TransactionCall => ({
			to: contractConfig.depositAddress!,
			data: encodeFunctionData({
				abi: DEPOSIT_ABI,
				functionName: 'batchDeposit',
				args: [
					depositData.pubkeys,
					depositData.withdrawal_credentials,
					depositData.signatures,
					depositData.deposit_data_roots,
					depositData.amounts,
				],
			}),
			title: 'Deposit GNO to contract',
		}),
		[contractConfig],
	);

	// Derived calls — updated reactively when deposits or allowance changes
	const depositCalls = useMemo((): TransactionCall[] => {
		if (!contractConfig?.tokenAddress || !contractConfig?.depositAddress || !deposits.length)
			return [];

		const depositsFormatted = deposits.map((d) => ({
			...d,
			amount: BigInt(parseGwei(d.amount.toString()) / contractConfig.cl.multiplier),
		}));
		const data = generateDepositData(depositsFormatted);
		const calls: TransactionCall[] = [];

		if ((allowance ?? 0n) < totalDepositAmount) {
			calls.push(buildApproveCall(totalDepositAmount));
		}
		calls.push(buildDepositCall(data));
		return calls;
	}, [deposits, allowance, totalDepositAmount, buildApproveCall, buildDepositCall, contractConfig]);

	const buildPartialDepositCalls = useCallback(
		(amounts: bigint[], validators: ValidatorInfo[]): TransactionCall[] => {
			if (!contractConfig?.tokenAddress || !contractConfig?.depositAddress) return [];

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
					depositReq.amount,
				);

				return {
					...depositReq,
					amount: depositReq.amount,
					pubkey: validator.pubkey.replace('0x', ''),
					signature: depositReq.signature.replace('0x', ''),
					deposit_data_root: deposit_data_root.replace('0x', ''),
					withdrawal_credentials: validator.withdrawal_credentials.replace('0x', ''),
					deposit_message_root:
						'0x0000000000000000000000000000000000000000000000000000000000000000',
					fork_version: contractConfig.forkVersion,
				};
			});

			const data = generateDepositData(depositsData);
			const totalAmount = amounts.reduce((acc, amt) => acc + amt, 0n);
			const calls: TransactionCall[] = [];

			if ((allowance ?? 0n) < totalAmount) {
				calls.push(buildApproveCall(totalAmount));
			}
			calls.push(buildDepositCall(data));
			return calls;
		},
		[contractConfig, allowance, buildApproveCall, buildDepositCall],
	);

	// Call after a successful deposit to refresh on-chain state
	const onDepositSuccess = useCallback(() => {
		refetchBalance();
		refetchAllowance();
	}, [refetchBalance, refetchAllowance]);

	return {
		depositCalls,
		buildPartialDepositCalls,
		onDepositSuccess,
		error: validationError,
		depositData: { deposits, credentialType, totalDepositAmount },
		setDepositData,
		allowance: allowance ?? 0n,
	};
}

export default useDeposit;
