import Link from "next/link";
import WalletModal from "./WalletModal";
import { Boldonse } from "next/font/google";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

const boldonse = Boldonse({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
});

export default function Navbar() {
	return (
		<div className="navbar sticky top-0 z-50 bg-base-200 border-b border-base-content/20 px-4 sm:px-8 shadow-xs">
			<div className={`flex items-center text-secondary flex-1 font-bold ${boldonse.className}`}>
				<Image src="/logo.svg" alt="Gnosis" width={30} height={30} className="mr-2" />
				<span className="hidden sm:inline">VALIDATORS</span>
			</div>
			<div className="flex items-center gap-x-4">
				{/* <Link href='/explorer' className="hover:text-black/70 font-medium">Explorer</Link> */}
				<Link href='https://www.validategnosis.com/' target="_blank" rel="noopener noreferrer" className="hover:text-black/70 flex font-medium items-center gap-x-1">Get Started <ExternalLink className="w-4 h-4" /></Link>
				<WalletModal />
			</div>
		</div>
	);
}