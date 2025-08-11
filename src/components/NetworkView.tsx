interface Chain {
    id: number;
    name: string;
}

interface NetworkViewProps {
    chains: readonly Chain[];
    currentChainId: number;
    handleNetworkChange: (chainId: number) => void;
    onBackToMain: () => void;
}

export function NetworkView({ chains, currentChainId, handleNetworkChange, onBackToMain }: NetworkViewProps) {
    return (
        <>
            {/* Header with Back Button */}
            <div className="px-4 py-4 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBackToMain}
                        className="btn btn-ghost btn-sm btn-circle"
                        aria-label="Back to wallet"
                    >
                        <img src="/arrow-left.svg" alt='Back' className="w-4 h-4" />
                    </button>
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
                                    <div className="badge badge-info badge-sm">
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