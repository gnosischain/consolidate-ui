import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { NetworkConfig } from "../types/network";
import ERC677ABI from "../utils/abis/erc677";
import depositABI from "../utils/abis/deposit";

function useBalance(contractConfig: NetworkConfig, address: `0x${string}`) {
  const queryClient = useQueryClient();
  const { data: claimHash, writeContract } = useWriteContract();
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });
  const { data: balance, queryKey } = useReadContract({
    abi: ERC677ABI,
    address: contractConfig.tokenAddress,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: claimBalance, queryKey: claimQueryKey } = useReadContract({
    abi: depositABI,
    address: contractConfig.depositAddress,
    functionName: "withdrawableAmount",
    args: [address],
  });

  const claim = useCallback(async () => {
    if (!contractConfig.depositAddress) {
      throw new Error("Deposit address is not set for network " + contractConfig.chainId);
    }
    writeContract({
      address: contractConfig.depositAddress,
      abi: depositABI,
      functionName: "claimWithdrawal",
      args: [address],
    });
  }, [address, contractConfig, writeContract]);

  const refetchBalance = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const refetchClaimBalance = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: claimQueryKey });
  }, [queryClient, claimQueryKey]);
  
  useEffect(() => {
    if (claimSuccess) {
      refetchBalance();
      refetchClaimBalance();
    }
  }, [claimSuccess, refetchBalance, refetchClaimBalance]);

  return { balance: balance || 0n, claimBalance: claimBalance || 0n, refetchBalance, refetchClaimBalance, claim, claimSuccess, claimHash };
}

export default useBalance;
