import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useCapabilities, useConnection } from 'wagmi';
import { NETWORK_CONFIG } from '../constants/networks';
import useBalance from '../hooks/useBalance';
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
  isMounted: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const account = useConnection();
  const capabilities = useCapabilities( {account: account.address});
  const chainId = account?.chainId;
  const chainName = account?.chain?.name;
  const network = chainId ? NETWORK_CONFIG[chainId] : undefined;
  const isWrongNetwork = Boolean(account.isConnected && !network);
  const balance = useBalance(network, account.address);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const value = {
    account: {
      isConnected: isMounted && account.isConnected,
      address: account.address,
    },
    canBatch: capabilities?.data?.[chainId ?? 0]?.atomic?.status === 'supported',
    canBatchLoading: capabilities.isLoading,
    chainId,
    chainName,
    network,
    isWrongNetwork: isMounted && isWrongNetwork,
    balance,
    isMounted,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 