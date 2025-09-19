'use client';

import { WrongNetwork } from '../components/WrongNetwork';
import Dashboard from '../components/Dashboard';
import { DisclaimerBanner } from '../components/Disclaimer';
import { useWallet } from '../context/WalletContext';
import Navbar from '../components/Navbar';

function App() {
	const { account, chainId, network, isWrongNetwork, balance } = useWallet();

	if (isWrongNetwork) {
		return <WrongNetwork />;
	}

	return (
		<div className="w-full flex flex-col">
			<Navbar />
			{/* Main content */}
			<div className="px-8 w-full mt-8">
				{account.isConnected && account.address && network && chainId && balance ? (
					<>
						<Dashboard />
					</>
				) : (
					<h1 className="text-xl font-bold">Please connect your wallet to continue</h1>
				)}
			</div>
			<DisclaimerBanner />
		</div>
	);
}

export default App;
