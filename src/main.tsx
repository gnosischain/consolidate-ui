import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { cacheExchange, createClient, fetchExchange, Provider } from "urql";
import { WagmiProvider } from 'wagmi';

import App from './App.tsx';
import { config } from './wagmi.ts';

import './index.css';

const queryClient = new QueryClient();

const client = createClient({
	url: import.meta.env.VITE_GRAPHQL_URL || "",
	exchanges: [cacheExchange, fetchExchange],
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<Provider value={client}>
					<App />
				</Provider>
			</QueryClientProvider>
		</WagmiProvider>
	</React.StrictMode>,
);
