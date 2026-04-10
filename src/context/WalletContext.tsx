import { createContext, useContext, ReactNode, useEffect, useState, useMemo } from 'react';
import { useCapabilities, useConnection, useBalance as useNativeBalance } from 'wagmi';
import { NETWORK_CONFIG } from '../constants/networks';
import useBalance from '../hooks/useBalance';
import { useAutoConnect } from '../hooks/useAutoconnect';
import { NetworkConfig } from '../types/network';
import { Address } from 'viem';

interface WalletContextType {
	account: {
		isConnected: boolean;
		address?: Address;
	};
	canBatch: boolean;
	canBatchLoading: boolean;
	chainId?: number;
	chainName?: string;
	network?: NetworkConfig;
	isWrongNetwork: boolean;
	balance: {
		balance: bigint;
		claimBalance: bigint;
		refetchBalance: () => void;
		refetchClaimBalance: () => void;
		claim: () => void;
	};
	nativeBalance: bigint;
	isMounted: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
	const [isMounted, setIsMounted] = useState(false);
	const account = useConnection();
	useAutoConnect(isMounted && !account.isConnected);
	const capabilities = useCapabilities({ account: account.address });
	const chainId = account?.chainId;
	const chainName = account?.chain?.name;
	const network = chainId ? NETWORK_CONFIG[chainId] : undefined;
	const isWrongNetwork = Boolean(account.isConnected && !network);
	const balance = useBalance(network, account.address);
	const { data: nativeBalanceData } = useNativeBalance({
		address: account.address,
		query: { enabled: !!account.address },
	});

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const value = useMemo(
		() => ({
			account: {
				isConnected: isMounted && account.isConnected,
				address: account.address,
			},
			canBatch:
				capabilities?.data?.[chainId ?? 0]?.atomic?.status === 'supported' ||
				capabilities?.data?.[chainId ?? 0]?.atomic?.status === 'ready',
			canBatchLoading: capabilities.isLoading,
			chainId,
			chainName,
			network,
			isWrongNetwork: isMounted && isWrongNetwork,
			balance,
			nativeBalance: nativeBalanceData?.value ?? 0n,
			isMounted,
		}),
		[
			isMounted,
			account.isConnected,
			account.address,
			capabilities?.data,
			capabilities.isLoading,
			chainId,
			chainName,
			network,
			isWrongNetwork,
			balance,
			nativeBalanceData?.value,
		],
	);

	return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
	const context = useContext(WalletContext);
	if (!context) {
		throw new Error('useWallet must be used within a WalletProvider');
	}
	return context;
}
