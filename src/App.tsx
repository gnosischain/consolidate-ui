import { useAccount, useDisconnect } from 'wagmi';
import './App.css';
import { WrongNetwork } from './components/WrongNetwork';
import { SelectWallet } from './components/SelectWallet';

function App() {
  const { isConnected, address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  if (isConnected && !chain?.id) {
    return <WrongNetwork />;
  }

  return (
    <div className='w-full h-screen flex flex-col items-center justify-center'>
      {isConnected && address ? (
        <div className='flex flex-col items-center'>
          <button
            type='button'
            onClick={() => disconnect()}
            className='btn'
          >
            disconnect
          </button>
          {address}
        </div>
      ) : (
        <SelectWallet />
      )}
    </div>
  );
}

export default App;
