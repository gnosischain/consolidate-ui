import { useCallback, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { NetworkConfig } from "../types/network";
import claimRegistryABI from "../utils/abis/claimRegistry";
import { parseUnits } from "viem";
import { SECOND_IN_DAY } from "../constants/misc";
import payClaimActionABI from "../utils/abis/payClaimAction";
import ERC677ABI from "../utils/abis/erc677";

function useAutoclaim(
    contractConfig: NetworkConfig,
    address: `0x${string}`,
) {
    const { data: transactionHash, writeContract } = useWriteContract();
    const { isSuccess: transactionSuccess, isLoading: transactionLoading } = useWaitForTransactionReceipt({
        hash: transactionHash,
    });

    const { data: userConfig, refetch: refetchUserConfig } = useReadContract(
        {
            address: contractConfig.claimRegistryAddress,
            abi: claimRegistryABI,
            functionName: 'configs',
            args: [address as `0x${string}`],
        }
    );

    const { data: actionContract, refetch: refetchActionContract } = useReadContract(
        {
            address: contractConfig.claimRegistryAddress,
            abi: claimRegistryABI,
            functionName: 'actionContract',
            args: [address as `0x${string}`],
        }
    );

    const { data: forwardingAddress, refetch: refetchForwardingAddress } = useReadContract(
        {
            address: contractConfig.payClaimActionAddress,
            abi: payClaimActionABI,
            functionName: 'forwardingAddresses',
            args: [address as `0x${string}`],
        }
    );

    const register = useCallback(
        async (days: number, amount: number, claimAction: `0x${string}`) => {
            if (contractConfig && contractConfig.claimRegistryAddress) {
                const timeStamp = BigInt(days * SECOND_IN_DAY);
                writeContract({ address: contractConfig.claimRegistryAddress, abi: claimRegistryABI, functionName: "register", args: [address, timeStamp, parseUnits(amount.toString(), 18), claimAction] });
            }
        },
        [address, contractConfig, writeContract]
    );

    const setActionContract = useCallback(
        async (actionContract: `0x${string}`) => {
            if (contractConfig && contractConfig.claimRegistryAddress) {
                writeContract({ address: contractConfig.claimRegistryAddress, abi: claimRegistryABI, functionName: "setActionContract", args: [address, actionContract] });
            }
        },
        [address, contractConfig, writeContract]
    );

    const updateConfig = useCallback(
        async (days: number, amount: number) => {
            if (contractConfig && contractConfig.claimRegistryAddress) {
                const timeStamp = BigInt(days * SECOND_IN_DAY);
                writeContract({ address: contractConfig.claimRegistryAddress, abi: claimRegistryABI, functionName: "updateConfig", args: [address, timeStamp, parseUnits(amount.toString(), 18)] });
            }
        },
        [address, contractConfig, writeContract]
    );

    const unregister = useCallback(async () => {
        if (contractConfig && contractConfig.claimRegistryAddress) {
            writeContract({
                address: contractConfig.claimRegistryAddress,
                abi: claimRegistryABI,
                functionName: 'unregister',
                args: [address],
            });
        }
    }, [address, contractConfig, writeContract]);

    const setForwardingAddress = useCallback(async (forwardingAddress: `0x${string}`) => {
        if (contractConfig && contractConfig.payClaimActionAddress) {
            writeContract({ address: contractConfig.payClaimActionAddress, abi: payClaimActionABI, functionName: "setForwardingAddress", args: [forwardingAddress] });
        }
    }, [contractConfig, writeContract]);

    const approve = useCallback(async () => {
        if (contractConfig && contractConfig.tokenAddress && contractConfig.payClaimActionAddress) {
            writeContract({ address: contractConfig.tokenAddress, abi: ERC677ABI, functionName: "approve", args: [contractConfig.payClaimActionAddress, parseUnits("1000000000000000000000000000000000000000", 18)] });
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
    };
}

export default useAutoclaim;
