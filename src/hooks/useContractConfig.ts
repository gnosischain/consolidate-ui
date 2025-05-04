import { useAccount } from 'wagmi';
import { NETWORK_CONFIG } from '../constants/networks';

const useContractConfig = () => {
	const account = useAccount();
	const chainId = account?.chainId;
	const network = chainId ? NETWORK_CONFIG[chainId] : undefined;
	const isWrongNetwork = !network;

	return { chainId, account, network, isWrongNetwork };
};

export default useContractConfig;
