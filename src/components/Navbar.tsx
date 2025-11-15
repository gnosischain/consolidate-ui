import Link from "next/link";
import WalletModal from "./WalletModal";

export default function Navbar() {
	return (
		<div className="navbar sticky top-0 z-50 bg-primary text-white border-b border-base-content/10 px-4 sm:px-12">
			<div className="flex-1 font-bold">
				Gnosis Launchpad
			</div>
			<div className="flex items-center gap-x-4">
				<Link href='/explorer' className="btn btn-ghost">Explorer</Link>
				<WalletModal />
			</div>
		</div>
	);
}