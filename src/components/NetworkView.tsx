import { useChains, useSwitchChain } from 'wagmi';
import { useWallet } from '../context/WalletContext';

export function NetworkView() {
	const { chainId } = useWallet();
	const switchChain = useSwitchChain();
	const chains = useChains();

	const handleNetworkChange = (chainId: number) => {
		const selectedChain = chains.find((chain) => chain.id === chainId);
		if (selectedChain) {
			switchChain.mutate({ chainId: selectedChain.id });
		}
	};

	return (
		<>
			<div className="border-base-300 border-b px-4 py-4">
				<div className="flex items-center justify-between">
					<h3 className="text-base font-semibold">Select Network</h3>
				</div>
			</div>

			{/* Network Selection Content */}
			<div className="px-4 py-4">
				<div className="space-y-2">
					{chains.map((chain) => {
						const isConnected = chain.id === chainId;
						return (
							<button
								key={chain.id}
								className="btn btn-ghost flex w-full items-center justify-between rounded-xl p-4 transition-all duration-200"
								onClick={() => handleNetworkChange(chain.id)}
							>
								<span className="font-medium">{chain.name}</span>
								{isConnected && (
									<div className="badge badge-secondary badge-soft badge-sm">Connected</div>
								)}
							</button>
						);
					})}
				</div>
			</div>
		</>
	);
}
