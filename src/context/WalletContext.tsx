import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAccount, useCapabilities } from 'wagmi';
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
  const account = useAccount();
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
    canBatch: capabilities?.data?.[chainId ?? 0].atomic.status == 'supported' ? true : false,
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