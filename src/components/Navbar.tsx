import WalletModal from "./WalletModal";

export default function Navbar() {
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
					<p className="text-sm font-semibold text-red-500">
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