import { NetworkConfig } from '../types/network';
import { AutoclaimConfigView } from './AutoclaimConfigView';
import { NetworkView } from './NetworkView';
import { useModal } from '../context/ModalContext';

interface AutoclaimViewProps {
	network: NetworkConfig;
	address: `0x${string}`;
}

export function AutoclaimView({ network, address }: AutoclaimViewProps) {
	const { openModal } = useModal();
	return (
		<>
			{/* Header with Back Button */}
			<div className="border-base-300 border-b px-4 py-4">
				<div className="flex items-center justify-between">
					<h3 className="text-base font-semibold">Autoclaim Registry</h3>
				</div>
			</div>

			{/* Autoclaim Content */}
			<div className="px-6 py-4">
				<div className="py-8 text-center">
					<div className="bg-base-200 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="h-8 w-8"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h4 className="mb-2 font-semibold">Autoclaim Registry</h4>
					<p className="text-base-content/70 mb-4 text-sm">
						Configure automatic claiming for your validator rewards.
					</p>
					{network.claimRegistryAddress && (
						<div className="space-y-3">
							<div className="bg-base-200 rounded-lg p-3 text-left">
								<p className="text-base-content/70 mb-1 text-xs">Registry Address</p>
								<p className="font-mono text-sm break-all">{network.claimRegistryAddress}</p>
							</div>
							<button
								className="btn btn-primary btn-sm mt-4 w-full"
								onClick={() =>
									openModal(<AutoclaimConfigView network={network} address={address} />)
								}
							>
								Configure Autoclaim
							</button>
						</div>
					)}
					{!network.claimRegistryAddress && (
						<>
							<div className="bg-warning/10 border-warning/20 rounded-lg border p-3">
								<p className="text-warning text-sm">
									Autoclaim registry not available for this network.
								</p>
							</div>
							<button
								className="btn btn-primary btn-xs mt-4"
								onClick={() => openModal(<NetworkView />)}
							>
								Switch to Gnosis Chain
							</button>
						</>
					)}
				</div>
			</div>
		</>
	);
}
