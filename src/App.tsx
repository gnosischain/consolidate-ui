import { useDisconnect } from 'wagmi';
import './App.css';
import { WrongNetwork } from './components/WrongNetwork';
import { SelectWallet } from './components/SelectWallet';
import { SelectNetwork } from './components/SelectNetwork';
import { truncateAddress } from './utils/address';
import Consolidate from './components/Consolidate';
import useContractConfig from './hooks/useContractConfig';

function App() {
  const { disconnect } = useDisconnect();
  const { account, chainId, contractConfig, isWrongNetwork } =
    useContractConfig();
  if (account.isConnected && isWrongNetwork) {
    return <WrongNetwork />;
  }

  return (
    <div className='w-full h-screen flex flex-col'>
      <div className='navbar bg-base-100 shadow-sm'>
        <div className='flex-1'>
          <a className='btn btn-ghost text-xl'>ConsolidateUI</a>
        </div>
        <div className='flex-none'>
          {account.isConnected && account.address && chainId ? (
            <div className='flex items-center gap-x-2'>
              <p className='text-sm'>{truncateAddress(account.address)}</p>
              <SelectNetwork currentChainId={chainId} />
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
      {/* Main content */}
      <div className='flex h-full w-full items-center justify-center'>
        <div className='flex max-w-4xl w-full border border-base-300 rounded-lg shadow-sm items-center justify-center p-8'>
          {account.isConnected &&
          account.address &&
          contractConfig &&
          chainId ? (
            <Consolidate
              contractConfig={contractConfig}
              address={account.address}
              api={account.chainId === 100}
            />
          ) : (
            <h1 className='text-xl font-bold'>
              Please connect your wallet to continue
            </h1>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
