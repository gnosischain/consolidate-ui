import { useCallback } from 'react';
import { useReadContract } from 'wagmi';
import { NetworkConfig } from '../types/network';
import claimRegistryABI from '../utils/abis/claimRegistry';
import { Address, encodeFunctionData, parseUnits } from 'viem';
import { SECOND_IN_DAY } from '../constants/misc';
import payClaimActionABI from '../utils/abis/payClaimAction';
import ERC677ABI from '../utils/abis/erc677';
import { TransactionCall } from '../types/transaction';

function useAutoclaim(contractConfig?: NetworkConfig, address?: Address) {
	const { data: userConfig, refetch: refetchUserConfig } = useReadContract({
		address: contractConfig?.claimRegistryAddress,
		abi: claimRegistryABI,
		functionName: 'configs',
		args: address ? [address] : undefined,
		query: {
			enabled: Boolean(contractConfig?.claimRegistryAddress && address),
		},
	});

	const { data: actionContract, refetch: refetchActionContract } = useReadContract({
		address: contractConfig?.claimRegistryAddress,
		abi: claimRegistryABI,
		functionName: 'actionContract',
		args: address ? [address] : undefined,
		query: {
			enabled: Boolean(contractConfig?.claimRegistryAddress && address),
		},
	});

	const { data: forwardingAddress, refetch: refetchForwardingAddress } = useReadContract({
		address: contractConfig?.payClaimActionAddress,
		abi: payClaimActionABI,
		functionName: 'forwardingAddresses',
		args: address ? [address] : undefined,
		query: {
			enabled: Boolean(contractConfig?.payClaimActionAddress && address),
		},
	});

	const buildRegisterCall = useCallback(
		(days: number, amount: number, claimAction: `0x${string}`): TransactionCall | null => {
			if (!contractConfig?.claimRegistryAddress || !address) return null;
			return {
				to: contractConfig.claimRegistryAddress,
				data: encodeFunctionData({
					abi: claimRegistryABI,
					functionName: 'register',
					args: [address, BigInt(days) * BigInt(SECOND_IN_DAY), parseUnits(amount.toString(), 18), claimAction],
				}),
				title: 'Register Autoclaim',
			};
		},
		[address, contractConfig],
	);

	const buildSetActionContractCall = useCallback(
		(actionContractAddress: `0x${string}`): TransactionCall | null => {
			if (!contractConfig?.claimRegistryAddress || !address) return null;
			return {
				to: contractConfig.claimRegistryAddress,
				data: encodeFunctionData({
					abi: claimRegistryABI,
					functionName: 'setActionContract',
					args: [address, actionContractAddress],
				}),
				title: 'Set Action Contract',
			};
		},
		[address, contractConfig],
	);

	const buildUpdateConfigCall = useCallback(
		(days: number, amount: number): TransactionCall | null => {
			if (!contractConfig?.claimRegistryAddress || !address) return null;
			return {
				to: contractConfig.claimRegistryAddress,
				data: encodeFunctionData({
					abi: claimRegistryABI,
					functionName: 'updateConfig',
					args: [address, BigInt(days) * BigInt(SECOND_IN_DAY), parseUnits(amount.toString(), 18)],
				}),
				title: 'Update Config',
			};
		},
		[address, contractConfig],
	);

	const buildUnregisterCall = useCallback((): TransactionCall | null => {
		if (!contractConfig?.claimRegistryAddress || !address) return null;
		return {
			to: contractConfig.claimRegistryAddress,
			data: encodeFunctionData({
				abi: claimRegistryABI,
				functionName: 'unregister',
				args: [address],
			}),
			title: 'Unregister Autoclaim',
		};
	}, [address, contractConfig]);

	const buildSetForwardingAddressCall = useCallback(
		(forwardingAddr: `0x${string}`): TransactionCall | null => {
			if (!contractConfig?.payClaimActionAddress) return null;
			return {
				to: contractConfig.payClaimActionAddress,
				data: encodeFunctionData({
					abi: payClaimActionABI,
					functionName: 'setForwardingAddress',
					args: [forwardingAddr],
				}),
				title: 'Set Forwarding Address',
			};
		},
		[contractConfig],
	);

	const buildApproveCall = useCallback((): TransactionCall | null => {
		if (!contractConfig?.tokenAddress || !contractConfig?.payClaimActionAddress) return null;
		return {
			to: contractConfig.tokenAddress,
			data: encodeFunctionData({
				abi: ERC677ABI,
				functionName: 'approve',
				args: [contractConfig.payClaimActionAddress, parseUnits('100', 18)],
			}),
			title: 'Approve',
		};
	}, [contractConfig]);

	const onSuccess = useCallback(() => {
		refetchUserConfig();
		refetchActionContract();
		refetchForwardingAddress();
	}, [refetchUserConfig, refetchActionContract, refetchForwardingAddress]);

	const isRegistered = userConfig?.[4] === 1;

	return {
		buildRegisterCall,
		buildSetActionContractCall,
		buildUpdateConfigCall,
		buildUnregisterCall,
		buildSetForwardingAddressCall,
		buildApproveCall,
		onSuccess,
		userConfig,
		actionContract,
		forwardingAddress,
		isRegistered,
	};
}

export default useAutoclaim;
