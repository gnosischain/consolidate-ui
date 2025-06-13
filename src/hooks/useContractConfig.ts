import { useAccount } from 'wagmi';
import { NETWORK_CONFIG } from '../constants/networks';
import useBalance from './useBalance';

const useContractConfig = () => {
	const account = useAccount();
	const chainId = account?.chainId;
	const network = chainId ? NETWORK_CONFIG[chainId] : undefined;
	const isWrongNetwork = !network;
	const balance = network && account.address ? useBalance(network, account.address) : undefined;

	return { chainId, account, network, isWrongNetwork, balance };
};

export default useContractConfig;
