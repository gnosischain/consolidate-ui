import { createContext, useContext, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { NETWORK_CONFIG } from '../constants/networks';
import useBalance from '../hooks/useBalance';
import { NetworkConfig } from '../types/network';
import { Address } from 'viem';

interface WalletContextType {
  account: {
    isConnected: boolean;
    address?: Address;
  };
  chainId?: number;
  network?: NetworkConfig;
  isWrongNetwork: boolean;
  balance: {
    balance: bigint;
    claimBalance: bigint;
    refetchBalance: () => void;
    refetchClaimBalance: () => void;
    claim: () => void;
  };
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const account = useAccount();
  const chainId = account?.chainId;
  const network = chainId ? NETWORK_CONFIG[chainId] : undefined;
  const isWrongNetwork = Boolean(account.isConnected && !network);
  const balance = useBalance(network, account.address);

  const value = {
    account,
    chainId,
    network,
    isWrongNetwork,
    balance,
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