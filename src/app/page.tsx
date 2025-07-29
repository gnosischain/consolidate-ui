'use client';

import { WrongNetwork } from '../components/WrongNetwork';
import Consolidate from '../components/Consolidate';
import { DisclaimerBanner } from '../components/Disclaimer';
import { useWallet } from '../context/WalletContext';
import Navbar from '../components/Navbar';

function App() {
	const { account, chainId, network, isWrongNetwork, balance } = useWallet();

	if (isWrongNetwork) {
		return <WrongNetwork />;
	}

	return (
		<div className="w-full h-screen flex flex-col">
			<Navbar />
			{/* Main content */}
			<div className="flex px-8 flex-col h-full w-full items-center justify-center bg-base-100">
				{account.isConnected && account.address && network && chainId && balance ? (
					<>
						<Consolidate />
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
