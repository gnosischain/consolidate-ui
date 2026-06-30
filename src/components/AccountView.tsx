import { useDisconnect } from 'wagmi';
import { truncateAddress } from '../utils/address';
import { ChevronRight } from 'lucide-react';
import { NetworkView } from './NetworkView';
import { useModal } from '../context/ModalContext';
import { AutoclaimModule } from './AutoclaimModule';
import { useWallet } from '../context/WalletContext';

export function AccountView() {
	const { account, canBatch, chainName } = useWallet();
	const address = account.address!;
	const disconnect = useDisconnect();
	const { openModal, closeModal } = useModal();

	return (
		<>
			{/* Header */}
			<div className="border-base-300 border-b px-6 py-4">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-base font-semibold">Wallet</h3>
						<p className="text-base-content/70 font-mono text-sm">{truncateAddress(address)}</p>
					</div>
					<div className="flex flex-col items-end gap-1">
						{canBatch && (
							<div className="badge badge-soft badge-sm gap-1">
								<span>⚡</span>
								<span className="text-xs">Batch</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Actions Section */}
			<div className="space-y-3 px-6 py-4">
				<AutoclaimModule />
				<button
					className="btn btn-ghost flex w-full justify-between"
					onClick={() => openModal(<NetworkView />)}
				>
					Network: {chainName}
					<ChevronRight className="h-4 w-4" />
				</button>
				<button
					onClick={() => {
						disconnect.mutate();
						closeModal();
					}}
					className="btn btn-outline btn-error btn-sm w-full gap-2"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="h-4 w-4"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
						/>
					</svg>
					Disconnect Wallet
				</button>
			</div>

			{/* External Links Section */}
			<div className="border-base-300 border-t">
				<div className="px-6 py-3">
					<h4 className="text-base-content/70 mb-3 text-sm font-medium">External Links</h4>
					<div className="space-y-1">
						<a
							href="https://discord.gg/gnosis"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:bg-base-200 group flex w-full items-center justify-between rounded-lg p-2 text-sm transition-colors duration-200"
						>
							<span>Get Help</span>
							<img
								src="/external.svg"
								alt="External Link"
								className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-70"
							/>
						</a>
						<a
							href="https://www.gnosis.io/"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:bg-base-200 group flex w-full items-center justify-between rounded-lg p-2 text-sm transition-colors duration-200"
						>
							<span>Explore Gnosis</span>
							<img
								src="/external.svg"
								alt="External Link"
								className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-70"
							/>
						</a>
					</div>
				</div>
			</div>
		</>
	);
}
