import { WagmiProvider } from 'wagmi';
import './App.css';
import { config } from './wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}></QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
