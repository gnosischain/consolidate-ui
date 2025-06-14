import './App.css';
import { WrongNetwork } from './components/WrongNetwork';
import Consolidate from './components/Consolidate';
import { DisclaimerBanner } from './components/Disclaimer';
import { useWallet } from './context/WalletContext';
import Navbar from './components/Navbar';

function App() {	
	const { account, chainId, network, isWrongNetwork, balance } = useWallet();

	if (isWrongNetwork) {
		return <WrongNetwork />;
	}

	return (
		<div className="w-full h-screen flex flex-col">
			<Navbar />
			{/* Main content */}
			<div className="flex h-full w-full items-center justify-center bg-base-100">
				<div className="flex max-w-4xl w-full bg-slate-800 rounded-lg shadow-sm items-center justify-center p-8">
					{account.isConnected && account.address && network && chainId && balance ? (
						<Consolidate />
					) : (
						<h1 className="text-xl font-bold">Please connect your wallet to continue</h1>
					)}
				</div>
			</div>
			<DisclaimerBanner />
		</div>
	);
}

export default App;
