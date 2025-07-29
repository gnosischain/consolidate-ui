import { useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { NetworkConfig } from "../types/network";
import claimRegistryABI from "../utils/abis/claimRegistry";
import { parseUnits } from "viem";
import { SECOND_IN_DAY } from "../constants/misc";

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

    const register = useCallback(
        async (days: number, amount: number) => {
            if (contractConfig && contractConfig.claimRegistryAddress) {
                const timeStamp = BigInt(days * SECOND_IN_DAY);
                writeContract({ address: contractConfig.claimRegistryAddress, abi: claimRegistryABI, functionName: "register", args: [address, timeStamp, parseUnits(amount.toString(), 18)] });
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

    return {
        register,
        updateConfig,
        unregister,
        isRegister: userConfig?.[4] === 1 ? true : false,
        autoclaimSuccess,
        autoclaimHash,
    };
}

export default useAutoclaim;
