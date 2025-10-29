'use client';

import { WrongNetwork } from '../components/WrongNetwork';
import Dashboard from '../components/Dashboard';
import { DisclaimerBanner } from '../components/Disclaimer';
import { useWallet } from '../context/WalletContext';
import LandingPage from '../components/LandingPage';

function App() {
	const { account, chainId, network, isWrongNetwork, balance } = useWallet();
	if (isWrongNetwork) {
		return <WrongNetwork />;
	}

	return (
		<>
			{account.isConnected && account.address && network && chainId && balance ? (
				<div className="px-2 sm:px-28 w-full sm:mt-8">
					<Dashboard />
				</div>
			) : (
				<LandingPage />
			)}
			<DisclaimerBanner />
		</>
	);
}

export default App;
