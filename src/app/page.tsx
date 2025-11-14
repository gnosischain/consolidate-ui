'use client';

import { WrongNetwork } from '../components/WrongNetwork';
import Dashboard from '../components/Dashboard';
import { DisclaimerBanner } from '../components/Disclaimer';
import { useWallet } from '../context/WalletContext';
import LandingPage from '../components/LandingPage';
import { useEffect } from 'react';
import { useModal } from '../context/ModalContext';

function App() {
	const { account, chainId, network, isWrongNetwork, balance } = useWallet();
	const { closeModal } = useModal();
	if (isWrongNetwork) {
		return <WrongNetwork />;
	}

	useEffect(() => {
		if (account) {
			closeModal();
		}
	}, [account]);

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
