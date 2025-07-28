import { useDisconnect } from "wagmi";
import { useWallet } from "../context/WalletContext";
import { truncateAddress } from "../utils/address";
import { SelectNetwork } from "./SelectNetwork";
import { SelectWallet } from "./SelectWallet";
import { Balance } from "./Balance";

export default function WalletModal() {
	const { account, chainId } = useWallet();
	const { disconnect } = useDisconnect();

	return (
		<>
			{account.isConnected && account.address && chainId ? (
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
						className="dropdown dropdown-end bg-base-100 rounded-2xl shadow-lg border border-base-300 p-0 w-80 max-w-sm"
						popover="auto"
						id="wallet-popover"
						style={{ positionAnchor: "--wallet-anchor" } as React.CSSProperties}
					>
						{/* Header */}
						<div className="px-6 py-4 border-b border-base-300">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="font-semibold text-base">Wallet</h3>
									<p className="text-sm text-base-content/70 font-mono">
										{truncateAddress(account.address)}
									</p>
								</div>
								<div className="badge badge-success badge-sm">Connected</div>
							</div>

							{/* Balance Section */}
							<div className="px-6 mt-8">
								<Balance />
							</div>
						</div>


						{/* Actions Section */}
						<div className="px-6 py-4 space-y-3">
							<button
								onClick={() => disconnect()}
								className="btn btn-outline btn-error btn-sm w-full gap-2"
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
									<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
								</svg>
								Disconnect Wallet
							</button>
						</div>

						{/* External Links Section */}
						<div className="border-t border-base-300">
							<div className="px-6 py-3">
								<h4 className="text-sm font-medium text-base-content/70 mb-3">External Links</h4>
								<div className="space-y-1">
									<a
										href="https://discord.gg/gnosis"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-between w-full p-2 text-sm rounded-lg hover:bg-base-200 transition-colors duration-200 group"
									>
										<span>Get Help</span>
										<img
											src="/external.svg"
											alt="External Link"
											className="w-3 h-3 opacity-50 group-hover:opacity-70 transition-opacity"
										/>
									</a>
									<a
										href="https://www.gnosis.io/"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center justify-between w-full p-2 text-sm rounded-lg hover:bg-base-200 transition-colors duration-200 group"
									>
										<span>Explore Gnosis</span>
										<img
											src="/external.svg"
											alt="External Link"
											className="w-3 h-3 opacity-50 group-hover:opacity-70 transition-opacity"
										/>
									</a>
								</div>
							</div>
						</div>
					</div>

					{/* Network Selector */}
					<SelectNetwork currentChainId={chainId} />
				</div>
			) : (
				<SelectWallet />
			)}
		</>
	);
}