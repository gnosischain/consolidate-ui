import { useCallback, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { NetworkConfig } from "../types/network";
import claimRegistryABI from "../utils/abis/claimRegistry";
import { Address, parseUnits } from "viem";
import { SECOND_IN_DAY } from "../constants/misc";
import payClaimActionABI from "../utils/abis/payClaimAction";
import ERC677ABI from "../utils/abis/erc677";

function useAutoclaim(
    contractConfig?: NetworkConfig,
    address?: Address,
) {
    const { data: transactionHash, writeContract } = useWriteContract();
    const { isSuccess: transactionSuccess, isLoading: transactionLoading } = useWaitForTransactionReceipt({
        hash: transactionHash,
    });

    const { data: userConfig, refetch: refetchUserConfig } = useReadContract(
        {
            address: contractConfig?.claimRegistryAddress,
            abi: claimRegistryABI,
            functionName: 'configs',
            args: address ? [address] : undefined,
            query: {
                enabled: Boolean(contractConfig?.claimRegistryAddress && address),
            },
        }
    );

    const { data: actionContract, refetch: refetchActionContract } = useReadContract(
        {
            address: contractConfig?.claimRegistryAddress,
            abi: claimRegistryABI,
            functionName: 'actionContract',
            args: address ? [address] : undefined,
            query: {
                enabled: Boolean(contractConfig?.claimRegistryAddress && address),
            },
        }
    );

    const { data: forwardingAddress, refetch: refetchForwardingAddress } = useReadContract(
        {
            address: contractConfig?.payClaimActionAddress,
            abi: payClaimActionABI,
            functionName: 'forwardingAddresses',
            args: address ? [address] : undefined,
            query: {
                enabled: Boolean(contractConfig?.payClaimActionAddress && address),
            },
        }
    );

    const register = useCallback(
        async (days: number, amount: number, claimAction: `0x${string}`) => {
            if (contractConfig?.claimRegistryAddress && address) {
                const timeStamp = BigInt(days) * BigInt(SECOND_IN_DAY);
                writeContract({ address: contractConfig.claimRegistryAddress, abi: claimRegistryABI, functionName: "register", args: [address, timeStamp, parseUnits(amount.toString(), 18), claimAction] });
            }
        },
        [address, contractConfig, writeContract]
    );

    const setActionContract = useCallback(
        async (actionContract: `0x${string}`) => {
            if (contractConfig?.claimRegistryAddress && address) {
                writeContract({ address: contractConfig.claimRegistryAddress, abi: claimRegistryABI, functionName: "setActionContract", args: [address, actionContract] });
            }
        },
        [address, contractConfig, writeContract]
    );

    const updateConfig = useCallback(
        async (days: number, amount: number) => {
            if (contractConfig?.claimRegistryAddress && address) {
                const timeStamp = BigInt(days) * BigInt(SECOND_IN_DAY);
                writeContract({ address: contractConfig.claimRegistryAddress, abi: claimRegistryABI, functionName: "updateConfig", args: [address, timeStamp, parseUnits(amount.toString(), 18)] });
            }
        },
        [address, contractConfig, writeContract]
    );

    const unregister = useCallback(async () => {
        if (contractConfig?.claimRegistryAddress && address) {
            writeContract({
                address: contractConfig.claimRegistryAddress,
                abi: claimRegistryABI,
                functionName: 'unregister',
                args: [address],
            });
        }
    }, [address, contractConfig, writeContract]);

    const setForwardingAddress = useCallback(async (forwardingAddress: `0x${string}`) => {
        if (contractConfig?.payClaimActionAddress) {
            writeContract({ address: contractConfig.payClaimActionAddress, abi: payClaimActionABI, functionName: "setForwardingAddress", args: [forwardingAddress] });
        }
    }, [contractConfig, writeContract]);

    const approve = useCallback(async () => {
        if (contractConfig?.tokenAddress && contractConfig?.payClaimActionAddress) {
            writeContract({ address: contractConfig.tokenAddress, abi: ERC677ABI, functionName: "approve", args: [contractConfig.payClaimActionAddress, parseUnits("100", 18)] });
        }
    }, [contractConfig, writeContract]);

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
        transactionHash,
        isRegistered,
    };
}

export default useAutoclaim;
