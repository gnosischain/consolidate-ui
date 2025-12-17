import { useCallback, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { NetworkConfig } from '../types/network';
import claimRegistryABI from '../utils/abis/claimRegistry';
import { Address, encodeFunctionData, parseUnits } from 'viem';
import { SECOND_IN_DAY } from '../constants/misc';
import payClaimActionABI from '../utils/abis/payClaimAction';
import ERC677ABI from '../utils/abis/erc677';
import { useTransaction, TransactionCall } from './useTransaction';

function useAutoclaim(contractConfig?: NetworkConfig, address?: Address) {
    const {
        execute,
        isPending: transactionLoading,
        isSuccess: transactionSuccess,
        error: transactionError,
    } = useTransaction();

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

    const register = useCallback(
        async (days: number, amount: number, claimAction: `0x${string}`) => {
            if (contractConfig?.claimRegistryAddress && address) {
                const timeStamp = BigInt(days) * BigInt(SECOND_IN_DAY);
                const callData = encodeFunctionData({
                    abi: claimRegistryABI,
                    functionName: 'register',
                    args: [address, timeStamp, parseUnits(amount.toString(), 18), claimAction],
                });

                const call: TransactionCall = {
                    to: contractConfig.claimRegistryAddress,
                    data: callData,
                };

                execute([call]);
            }
        },
        [address, contractConfig, execute]
    );

    const setActionContract = useCallback(
        async (actionContractAddress: `0x${string}`) => {
            if (contractConfig?.claimRegistryAddress && address) {
                const callData = encodeFunctionData({
                    abi: claimRegistryABI,
                    functionName: 'setActionContract',
                    args: [address, actionContractAddress],
                });

                const call: TransactionCall = {
                    to: contractConfig.claimRegistryAddress,
                    data: callData,
                };

                execute([call]);
            }
        },
        [address, contractConfig, execute]
    );

    const updateConfig = useCallback(
        async (days: number, amount: number) => {
            if (contractConfig?.claimRegistryAddress && address) {
                const timeStamp = BigInt(days) * BigInt(SECOND_IN_DAY);
                const callData = encodeFunctionData({
                    abi: claimRegistryABI,
                    functionName: 'updateConfig',
                    args: [address, timeStamp, parseUnits(amount.toString(), 18)],
                });

                const call: TransactionCall = {
                    to: contractConfig.claimRegistryAddress,
                    data: callData,
                };

                execute([call]);
            }
        },
        [address, contractConfig, execute]
    );

    const unregister = useCallback(async () => {
        if (contractConfig?.claimRegistryAddress && address) {
            const callData = encodeFunctionData({
                abi: claimRegistryABI,
                functionName: 'unregister',
                args: [address],
            });

            const call: TransactionCall = {
                to: contractConfig.claimRegistryAddress,
                data: callData,
            };

            execute([call]);
        }
    }, [address, contractConfig, execute]);

    const setForwardingAddress = useCallback(
        async (forwardingAddr: `0x${string}`) => {
            if (contractConfig?.payClaimActionAddress) {
                const callData = encodeFunctionData({
                    abi: payClaimActionABI,
                    functionName: 'setForwardingAddress',
                    args: [forwardingAddr],
                });

                const call: TransactionCall = {
                    to: contractConfig.payClaimActionAddress,
                    data: callData,
                };

                execute([call]);
            }
        },
        [contractConfig, execute]
    );

    const approve = useCallback(async () => {
        if (contractConfig?.tokenAddress && contractConfig?.payClaimActionAddress) {
            const callData = encodeFunctionData({
                abi: ERC677ABI,
                functionName: 'approve',
                args: [contractConfig.payClaimActionAddress, parseUnits('100', 18)],
            });

            const call: TransactionCall = {
                to: contractConfig.tokenAddress,
                data: callData,
            };

            execute([call]);
        }
    }, [contractConfig, execute]);

    useEffect(() => {
        if (transactionSuccess) {
            console.log('Transaction successful, refetching all data');
            refetchUserConfig();
            refetchActionContract();
            refetchForwardingAddress();
        }
    }, [transactionSuccess, refetchUserConfig, refetchActionContract, refetchForwardingAddress]);

    const isRegistered = userConfig?.[4] === 1;

    return {
        register,
        setActionContract,
        updateConfig,
        unregister,
        setForwardingAddress,
        approve,
        userConfig,
        actionContract,
        forwardingAddress,
        transactionSuccess,
        transactionLoading,
        transactionError,
        isRegistered,
    };
}

export default useAutoclaim;
