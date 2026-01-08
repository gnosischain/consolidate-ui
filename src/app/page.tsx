'use client';

import { WrongNetwork } from '../components/WrongNetwork';
import Dashboard from '../components/Dashboard';
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
		if (account.isConnected) {
			closeModal();
		}
	}, [account.isConnected, closeModal]);

	return (
		<>
			<div className="relative px-2 sm:px-28 w-full min-h-screen">
				<div className="mt-4 sm:mt-8">
					<Dashboard />
				</div>
				{!account.isConnected && <LandingPage />}
			</div>
		</>
	);
}

export default App;
