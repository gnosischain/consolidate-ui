import { useAccount, useDisconnect } from 'wagmi';
import './App.css';
import { WrongNetwork } from './components/WrongNetwork';
import { SelectWallet } from './components/SelectWallet';
import { SelectNetwork } from './components/SelectNetwork';

function App() {
  const { isConnected, address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  if (isConnected && !chain?.id) {
    return <WrongNetwork />;
  }

  return (
    <div className='w-full h-screen flex flex-col items-center justify-center'>
      {isConnected && address && chain ? (
        <div className='flex flex-col items-center'>
          <div className='flex gap-x-2 items-center'>
            <SelectNetwork currentChainId={chain.id} />
            {address}
          </div>
          <button type='button' onClick={() => disconnect()} className='btn'>
            disconnect
          </button>
        </div>
      ) : (
        <SelectWallet />
      )}
    </div>
  );
}

export default App;
