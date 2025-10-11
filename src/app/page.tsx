'use client';

import { WrongNetwork } from '../components/WrongNetwork';
import Dashboard from '../components/Dashboard';
import { DisclaimerBanner } from '../components/Disclaimer';
import { useWallet } from '../context/WalletContext';
import Navbar from '../components/Navbar';
import LandingPage from '../components/LandingPage';

function App() {
	const { account, chainId, network, isWrongNetwork, balance } = useWallet();

	if (isWrongNetwork) {
		return <WrongNetwork />;
	}

	return (
		<div className="w-full flex flex-col min-h-screen bg-base-200">
			<Navbar />
			{account.isConnected && account.address && network && chainId && balance ? (
				<div className="px-8 sm:px-28 w-full mt-8">
					<Dashboard />
				</div>
			) : (
				<LandingPage />
			)}
			<DisclaimerBanner />
		</div>
	);
}

export default App;
