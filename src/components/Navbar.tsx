import WalletModal from "./WalletModal";

export default function Navbar() {
	return (
		<div className="navbar z-50 bg-base-200 shadow-sm">
			<div className="flex-1">
				<div className="flex justify-center sm:justify-start mt-4 sm:mt-0">
					Gnosis Launchpad
					<p className="text-sm font-semibold text-red-500 ml-2">
						BETA
					</p>
				</div>
			</div>
			<div className="flex gap-x-2">
				<WalletModal />
			</div>
		</div>
	);
}