'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { WalletProvider } from "../context/WalletContext"
import { ModalProvider } from "../context/ModalContext"
import { Toaster } from 'react-hot-toast'
import { config } from "../wagmi"

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <ModalProvider>
            {children}
            <Toaster toastOptions={{ position: 'bottom-right', duration: 3000 }} />
          </ModalProvider>
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 