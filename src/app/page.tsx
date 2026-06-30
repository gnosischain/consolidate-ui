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

	useEffect(() => {
		if (account.isConnected) {
			closeModal();
		}
	}, [account.isConnected, closeModal]);

	if (isWrongNetwork) {
		return <WrongNetwork />;
	}

	return (
		<>
			<div className="relative min-h-screen w-full px-2 sm:px-28">
				<div className="mt-4 sm:mt-8">
					<Dashboard />
				</div>
				{!account.isConnected && <LandingPage />}
			</div>
		</>
	);
}

export default App;
