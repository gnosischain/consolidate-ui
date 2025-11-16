import Link from "next/link";
import WalletModal from "./WalletModal";
import { Boldonse } from "next/font/google";
import Image from "next/image";

const boldonse = Boldonse({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
});

export default function Navbar() {
	return (
		<div className="navbar sticky top-0 z-50 bg-base-200 border-b border-base-content/10 px-4 sm:px-8 shadow-md">
			<div className={`flex items-center text-primary flex-1 font-bold ${boldonse.className}`}>
				<Image src="/logo.svg" alt="Gnosis" width={30} height={30} className="mr-2" />
				VALIDATORS
			</div>
			<div className="flex items-center gap-x-4">
				<Link href='/explorer' className="btn btn-ghost">Explorer</Link>
				<WalletModal />
			</div>
		</div>
	);
}