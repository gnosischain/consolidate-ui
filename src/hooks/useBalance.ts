import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useCallback, useEffect } from "react";
import { NetworkConfig } from "../types/network";
import ERC677ABI from "../utils/abis/erc677";
import depositABI from "../utils/abis/deposit";

function useBalance(contractConfig: NetworkConfig | undefined, address: `0x${string}` | undefined) {
  const { data: claimHash, writeContract } = useWriteContract();
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });
  const { data: balance, refetch: refetchBalance } = useReadContract({
    abi: ERC677ABI,
    address: contractConfig?.tokenAddress,
    functionName: "balanceOf",
    args: [address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!contractConfig?.tokenAddress && !!address,
    },
  });

  const { data: claimBalance, refetch: refetchClaimBalance } = useReadContract({
    abi: depositABI,
    address: contractConfig?.depositAddress,
    functionName: "withdrawableAmount",
    args: [address || "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: !!contractConfig?.depositAddress && !!address,
    },
  });

  const claim = useCallback(async () => {
    if (!contractConfig?.depositAddress) {
      throw new Error("Deposit address is not set for network " + contractConfig?.chainId);
    }
    writeContract({
      address: contractConfig.depositAddress,
      abi: depositABI,
      functionName: "claimWithdrawal",
      args: [address || "0x0000000000000000000000000000000000000000"],
    });
  }, [address, contractConfig, writeContract]);
  
  useEffect(() => {
    if (claimSuccess) {
      refetchBalance();
      refetchClaimBalance();
    }
  }, [claimSuccess, refetchBalance, refetchClaimBalance]);

  return { balance: balance || 0n, claimBalance: claimBalance || 0n, refetchBalance, refetchClaimBalance, claim, claimSuccess, claimHash };
}

export default useBalance;
