import { useAccount, useConnect, useDisconnect } from 'wagmi';
import './App.css';
import { WrongNetwork } from './components/WrongNetwork';

function App() {
  const { isConnected, address, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  if (isConnected && !chain?.id) {
    return <WrongNetwork />;
  }

  return (
    <div className='w-full h-screen flex flex-col items-center justify-center'>
      {isConnected && address ? (
        <div>
          <button
            type='button'
            onClick={() => disconnect()}
            className='bg-[#FAB414] text-black px-4 py-2 rounded-full font-semibold hover:bg-[#F9A800] transition duration-300 cursor-pointer'
          >
            disconnect
          </button>
          {address}
        </div>
      ) : (
        <button
          type='button'
          onClick={() => connect({ connector: connectors[0] })}
          className='bg-[#FAB414] text-black px-4 py-2 rounded-full font-semibold hover:bg-[#F9A800] transition duration-300 cursor-pointer'
        >
          CONNECT
        </button>
      )}
    </div>
  );
}

export default App;
