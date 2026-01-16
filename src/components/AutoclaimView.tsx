import { NetworkConfig } from "../types/network";
import { AutoclaimConfigView } from "./AutoclaimConfigView";
import { NetworkView } from "./NetworkView";
import { useModal } from "../context/ModalContext";

interface AutoclaimViewProps {
    network: NetworkConfig;
    address: `0x${string}`;
}

export function AutoclaimView({ network, address }: AutoclaimViewProps) {
    const { openModal } = useModal();
    return (
        <>
            {/* Header with Back Button */}
            <div className="px-4 py-4 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">Autoclaim Registry</h3>
                </div>
            </div>

            {/* Autoclaim Content */}
            <div className="px-6 py-4">
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 className="font-semibold mb-2">Autoclaim Registry</h4>
                    <p className="text-sm text-base-content/70 mb-4">
                        Configure automatic claiming for your validator rewards.
                    </p>
                    {network.claimRegistryAddress && (
                        <div className="space-y-3">
                            <div className="bg-base-200 rounded-lg p-3 text-left">
                                <p className="text-xs text-base-content/70 mb-1">Registry Address</p>
                                <p className="font-mono text-sm break-all">{network.claimRegistryAddress}</p>
                            </div>
                            <button className="btn btn-primary btn-sm w-full mt-4" onClick={() => openModal(<AutoclaimConfigView network={network} address={address} />)}>
                                Configure Autoclaim
                            </button>
                        </div>
                    )}
                    {!network.claimRegistryAddress && (
                        <>
                        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                            <p className="text-sm text-warning">
                                Autoclaim registry not available for this network.
                            </p>
                        </div>
                        <button className="btn btn-primary btn-xs mt-4" onClick={() => openModal(<NetworkView />)}>
                            Switch to Gnosis Chain
                        </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
} 