'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cacheExchange, createClient, fetchExchange, Provider } from "urql"
import { WagmiProvider } from "wagmi"
import { WalletProvider } from "../context/WalletContext"
import { ModalProvider } from "../context/ModalContext"
import { Toaster } from 'react-hot-toast'
import { config } from "../wagmi"

const queryClient = new QueryClient();

const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
if (!graphqlUrl) {
  throw new Error('Environment variable NEXT_PUBLIC_GRAPHQL_URL is not defined');
}

const client = createClient({
  url: graphqlUrl,
  exchanges: [cacheExchange, fetchExchange],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Provider value={client}>
          <WalletProvider>
            <ModalProvider>
              {children}
              <Toaster toastOptions={{ position: 'bottom-right', duration: 3000 }} />
            </ModalProvider>
          </WalletProvider>
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 