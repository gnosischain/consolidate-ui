import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { cacheExchange, createClient, fetchExchange, Provider } from "urql";
import { WagmiProvider } from 'wagmi';

import App from './App.tsx';
import { config } from './wagmi.ts';

import './index.css';

const queryClient = new QueryClient();


const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;
if (!graphqlUrl)
	throw new Error('Environment variable VITE_GRAPHQL_URL is not defined');

const client = createClient({
	url: graphqlUrl,
	exchanges: [cacheExchange, fetchExchange],
});

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
