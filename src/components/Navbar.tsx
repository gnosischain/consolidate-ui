import WalletModal from "./WalletModal";

export default function Navbar() {
	return (
		<div className="navbar z-50 bg-base-200 shadow-sm">
			<div className="flex-1 font-bold">
					Gnosis Launchpad
			</div>
			<div className="flex gap-x-2">
				<WalletModal />
			</div>
		</div>
	);
}