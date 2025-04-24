import { useAccount, useDisconnect } from 'wagmi';
import './App.css';
import { WrongNetwork } from './components/WrongNetwork';
import { SelectWallet } from './components/SelectWallet';
import { SelectNetwork } from './components/SelectNetwork';
import { truncateAddress } from './utils/address';

function App() {
  const { isConnected, address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  if (isConnected && !chain?.id) {
    return <WrongNetwork />;
  }

  return (
    <div className='w-full h-screen flex flex-col'>
      <div className='navbar bg-base-100 shadow-sm'>
        <div className='flex-1'>
          <a className='btn btn-ghost text-xl'>ConsolidateUI</a>
        </div>
        <div className='flex-none'>
          {isConnected && address && chain ? (
            <div className='flex items-center gap-x-2'>
              <p className='text-sm'>{truncateAddress(address)}</p>
              <SelectNetwork currentChainId={chain.id} />
              <button
                type='button'
                onClick={() => disconnect()}
                className='btn'
              >
                disconnect
              </button>
            </div>
          ) : (
            <SelectWallet />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
