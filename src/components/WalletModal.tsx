import { useSwitchChain } from "wagmi";
import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { truncateAddress } from "../utils/address";
import { SelectWallet } from "./SelectWallet";
import { AccountView } from "./AccountView";
import { AutoclaimView } from "./AutoclaimView";
import { NetworkView } from "./NetworkView";

type ModalView = 'main' | 'autoclaim' | 'network';

export default function WalletModal() {
	const { account, chainId, chainName, network } = useWallet();
	const { chains, switchChain } = useSwitchChain();
	const [currentView, setCurrentView] = useState<ModalView>('main');
	const [isTransitioning, setIsTransitioning] = useState(false);
	const handleViewChange = (view: ModalView) => {
		setIsTransitioning(true);
		setTimeout(() => {
			setCurrentView(view);
			setIsTransitioning(false);
		}, 150);
	};

	const handleNetworkChange = (chainId: number) => {
		const selectedChain = chains.find((chain) => chain.id === chainId);
		if (selectedChain) {
			switchChain({ chainId: selectedChain.id });
		}
	};

	return (
		<>
			{account.isConnected && account.address && network && chainId && chainName ? (
				<div className="flex items-center gap-x-3">
					{/* Wallet Button */}
					<button
						className="btn btn-ghost btn-sm flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-base-300 transition-all duration-200"
						popoverTarget="wallet-popover"
						style={{ anchorName: "--wallet-anchor" } as React.CSSProperties}
					>
						<span className="font-medium">{truncateAddress(account.address)}</span>
						<img src="/bars3.svg" alt="Menu" className="w-4 h-4 opacity-70" />
					</button>

					{/* Wallet Popover */}
					<div
						className={`dropdown dropdown-end bg-base-100 rounded-2xl shadow-lg border border-base-300 p-0 w-80 max-w-sm transition-all duration-300 ease-in-out ${
							isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
						}`}
						popover="auto"
						id="wallet-popover"
						style={{ positionAnchor: "--wallet-anchor" } as React.CSSProperties}
					>
						{currentView === 'main' && (
							<AccountView
								address={account.address}
								onViewChange={handleViewChange}
								connectedChain={chainName}
							/>
						)}
						{currentView === 'autoclaim' && (
							<AutoclaimView
								network={network}
								onBackToMain={() => handleViewChange('main')}
							/>
						)}
						{currentView === 'network' && (
							<NetworkView
								chains={chains}
								currentChainId={chainId}
								handleNetworkChange={handleNetworkChange}
								onBackToMain={() => handleViewChange('main')}
							/>
						)}
					</div>
				</div>
			) : (
				<SelectWallet />
			)}
		</>
	);
}