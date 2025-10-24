import { useSwitchChain } from "wagmi";
import { useWallet } from "../context/WalletContext";
import { truncateAddress } from "../utils/address";
import { SelectWallet } from "./SelectWallet";
import { AccountView } from "./AccountView";
import { AutoclaimView } from "./AutoclaimView";
import { NetworkView } from "./NetworkView";
import { AutoclaimConfigView } from "./AutoclaimConfigView";
import { Menu } from "lucide-react";
import ModalButton from "./ModalButton";
import { useViewTransition } from "../hooks/useViewTransition";

export type ModalView = 'main' | 'autoclaim' | 'network' | 'autoclaim-config';

export default function WalletModal() {
	const { account, canBatch, chainId, chainName, network } = useWallet();
	const { chains, switchChain } = useSwitchChain();
	const { currentView, isTransitioning, changeView } = useViewTransition<ModalView>('main');

	const handleNetworkChange = (chainId: number) => {
		const selectedChain = chains.find((chain) => chain.id === chainId);
		if (selectedChain) {
			switchChain({ chainId: selectedChain.id });
		}
	};

	return (
		<>
			{account.isConnected && account.address && network && chainId && chainName ? (
				<ModalButton
					trigger={(openModal) => (
						<button
							className="btn btn-ghost flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-base-300 transition-all duration-200"
							onClick={() => {
								changeView('main');
								openModal();
							}}
						>
							<span className="font-medium">{account.address && truncateAddress(account.address)}</span>
							<Menu className="w-4 h-4" />
						</button>
					)}
				>
					<div className={`transition-all duration-300 ease-in-out ${
						isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
					}`}>
						{currentView === 'main' && (
							<AccountView
								address={account.address}
								canBatch={canBatch}
								onViewChange={changeView}
								connectedChain={chainName}
							/>
						)}
						{currentView === 'autoclaim' && (
							<AutoclaimView
								network={network}
								handleViewChange={changeView}
							/>
						)}
						{currentView === 'network' && (
							<NetworkView
								chains={chains}
								currentChainId={chainId}
								handleNetworkChange={handleNetworkChange}
								onBackToMain={() => changeView('main')}
							/>
						)}
						{currentView === 'autoclaim-config' && (
							<AutoclaimConfigView
								network={network}
								address={account.address}
								handleViewChange={changeView}
							/>
						)}
					</div>
				</ModalButton>
			) : (
				<ModalButton title="Connect Wallet">
					<SelectWallet />
				</ModalButton>
			)}
		</>
	);
}