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
	const { account, chainId, network, isWrongNetwork } = useContractConfig();
	if (account.isConnected && isWrongNetwork) {
		return <WrongNetwork />;
	}

	return (
		<div className="w-full h-screen flex flex-col">
			<div className="navbar bg-base-100 shadow-sm">
				<div className="flex-1">
				<div className='flex justify-center sm:justify-start mt-4 sm:mt-0'>
                <img
                  src='/logo.svg'
                  alt='Gnosis Logo'
                  width={45}
                  height={24}
                />
                <div className='flex flex-col ml-2 justify-center'>
                  <img
                    src='/gnosis.svg'
                    alt='Gnosis Text'
                    width={100}
                    height={24}
                    className='mb-1 mt-0.5'
                  />
                  <p className='text-[6px] leading-[6px] sm:text-[8px] sm:leading-[8px] mt-1 '>
                    BEACON CHAIN CONSOLIDATION
                  </p>
				  </div>
                </div>
				</div>
				<div className="flex gap-x-2">
					<a href="https://www.gnosis.io/" target='_blank' className="underline text-sm flex items-center">Explore<img src='/external.svg' alt='External Link' className='w-3 h-3 ml-1'/></a>
					{account.isConnected && account.address && chainId ? (
						<div className="flex items-center gap-x-2">
							<p className="text-sm">{truncateAddress(account.address)}</p>
							<SelectNetwork currentChainId={chainId} />
							<button type="button" onClick={() => disconnect()} className="btn">
								disconnect
							</button>
						</div>
					) : (
						<SelectWallet />
					)}
				</div>
			</div>
			{/* Main content */}
			<div className="flex h-full w-full items-center justify-center">
				<div className="flex max-w-4xl w-full border border-base-300 rounded-lg shadow-sm items-center justify-center p-8">
					{account.isConnected && account.address && network && chainId ? (
						<Consolidate network={network} address={account.address} />
					) : (
						<h1 className="text-xl font-bold">Please connect your wallet to continue</h1>
					)}
				</div>
			</div>
		</div>
	);
}

export default App;
