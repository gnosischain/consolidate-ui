import { useSwitchChain } from "wagmi";

interface NetworkViewProps {
    currentChainId: number;
}

export function NetworkView({ currentChainId }: NetworkViewProps) {
    const { chains, switchChain } = useSwitchChain();

    const handleNetworkChange = (chainId: number) => {
		const selectedChain = chains.find((chain) => chain.id === chainId);
		if (selectedChain) {
			switchChain({ chainId: selectedChain.id });
		}
	};
    
    return (
        <>
            {/* Header with Back Button */}
            <div className="px-4 py-4 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">Select Network</h3>
                    <div className="w-8"></div> {/* Spacer for centering */}
                </div>
            </div>

            {/* Network Selection Content */}
            <div className="px-4 py-4">
                <div className="space-y-2">
                    {chains.map((chain) => {
                        const isConnected = chain.id === currentChainId;
                        return (
                            <button
                                key={chain.id}
                                className="btn btn-ghost w-full flex justify-between items-center p-4 rounded-xl transition-all duration-200"
                                onClick={() => handleNetworkChange(chain.id)}
                            >
                                <span className="font-medium">{chain.name}</span>
                                {isConnected && (
                                    <div className="badge badge-secondary badge-soft badge-sm">
                                        Connected
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
} 