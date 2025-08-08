import { useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { NetworkConfig } from "../types/network";
import claimRegistryABI from "../utils/abis/claimRegistry";
import { parseUnits } from "viem";
import { SECOND_IN_DAY } from "../constants/misc";
import payClaimActionABI from "../utils/abis/payClaimAction";

function useAutoclaim(
    contractConfig: NetworkConfig,
    address: `0x${string}`,
) {
    const { data: autoclaimHash, writeContract } = useWriteContract();
    const { isSuccess: autoclaimSuccess } = useWaitForTransactionReceipt({
        hash: autoclaimHash,
    });

    const { data: userConfig } = useReadContract(
        {
            address: contractConfig.claimRegistryAddress,
            abi: claimRegistryABI,
            functionName: 'configs',
            args: [address as `0x${string}`],
        }
    );

    const { data: actionContract } = useReadContract(
        {
            address: contractConfig.claimRegistryAddress,
            abi: claimRegistryABI,
            functionName: 'actionContract',
            args: [address as `0x${string}`],
        }
    );

    const { data: forwardingAddress } = useReadContract(
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

    return {
        register,
        setActionContract,
        updateConfig,
        unregister,
        setForwardingAddress,
        userConfig,
        actionContract,
        forwardingAddress,
        autoclaimSuccess,
        autoclaimHash,
    };
}

export default useAutoclaim;
