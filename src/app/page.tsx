'use client';

import { WrongNetwork } from '../components/WrongNetwork';
import Dashboard from '../components/Dashboard';
import { DisclaimerBanner } from '../components/Disclaimer';
import { useWallet } from '../context/WalletContext';
import LandingPage from '../components/LandingPage';
import { useEffect } from 'react';
import { useModal } from '../context/ModalContext';

function App() {
	const { account, isWrongNetwork } = useWallet();
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
			<div className="relative px-2 sm:px-28 w-full sm:mt-8 min-h-screen">
				<Dashboard />
				{!account.isConnected && <LandingPage />}
			</div>
			<DisclaimerBanner />
		</>
	);
}

export default App;
