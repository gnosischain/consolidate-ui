import { useAccount } from "wagmi";
import { NETWORK_CONFIG } from "../constants/networks";

const useContractConfig = () => {
  const account = useAccount();
  const chainId = account?.chainId;
  const contractConfig = chainId ? NETWORK_CONFIG[chainId] : undefined;
  const isWrongNetwork = !contractConfig;

  return { chainId, account, contractConfig, isWrongNetwork };
};

export default useContractConfig;
