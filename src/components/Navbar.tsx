import WalletModal from "./WalletModal";

export default function Navbar() {
	return (
		<div className="navbar sticky top-0 z-50 bg-base-100 border-b border-base-content/10 px-4 sm:px-12">
			<div className="flex-1 font-bold">
					Gnosis Launchpad
			</div>
			<div className="flex gap-x-2">
				<WalletModal />
			</div>
		</div>
	);
}