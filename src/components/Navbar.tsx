import { truncateAddress } from "../utils/address";
import { SelectNetwork } from "./SelectNetwork";
import { useWallet } from "../context/WalletContext";
import { useDisconnect } from "wagmi";
import { SelectWallet } from "./SelectWallet";

export default function Navbar() {
	const { account, chainId } = useWallet();
	const { disconnect } = useDisconnect();
	return (
		<div className="navbar z-50 bg-base-200 shadow-sm">
				<div className="flex-1">
					<div className="flex justify-center sm:justify-start mt-4 sm:mt-0">
						<img src="/logo.svg" alt="Gnosis Logo" width={45} height={24} />
						<div className="flex flex-col ml-2 justify-center">
							<img
								src="/gnosis.svg"
								alt="Gnosis Text"
								width={100}
								height={24}
								className="mb-1 mt-0.5"
							/>
							<p className="text-[6px] leading-[6px] sm:text-[8px] sm:leading-[8px] mt-1 ">
								BEACON CHAIN CONSOLIDATION
							</p>
						</div>
					</div>
				</div>
				<div className="flex gap-x-2">
					<a
						href="https://www.gnosis.io/"
						target="_blank"
						className="underline text-sm flex items-center"
					>
						Explore
						<img src="/external.svg" alt="External Link" className="w-3 h-3 ml-1" />
					</a>
					{account.isConnected && account.address && chainId ? (
						<div className="flex items-center gap-x-2">
							<p className="text-sm">{truncateAddress(account.address)}</p>
							<SelectNetwork currentChainId={chainId} />
							<button type="button" onClick={() => disconnect()} className="btn">
								disconnect
							</button>
						</div>
					) : (
						<SelectWallet />
					)}
				</div>
		</div>
	);
}