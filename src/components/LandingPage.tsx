import { Boldonse } from "next/font/google";
import Image from "next/image";

const boldonse = Boldonse({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
});

export default function LandingPage() {
	return (
		<div className="absolute inset-0 z-30 flex items-center justify-center bg-base-300/20 backdrop-blur-xs px-4">

			{/* Content */}
			<div className="relative flex flex-col items-center justify-center px-4 py-20">

				{/* Hero Title */}
				<div className="flex flex-col items-center justify-center mb-10">
					<Image src="/gnosis-purple.svg" alt="Gnosis" width={600} height={600} />
					<h1 className={`text-6xl md:text-9xl font-bold mb-8 text-accent ${boldonse.className}`}>
						VALIDATORS
					</h1>
					<p className="text-xl md:text-2xl text-base-content/70 max-w-2xl font-medium">
						Manage your validators on Gnosis Chain
					</p>
				</div>

				{/* CTA Button */}
				<div className="mb-24 flex flex-col items-center justify-center border-t border-base-content/10 pt-10 px-4">
					<span className="text-lg font-semibold text-base-content">Connect your wallet to view your validators</span>
					<p className="text-sm text-gray-500">
						New here? <a href="https://www.validategnosis.com/" target="_blank" rel="noopener noreferrer" className="underline">Learn about Gnosis validators</a>
					</p>
				</div>

				{/* Footer Note */}
				<div className="mt-16 text-center">
					<p className="text-sm text-base-content/50">
						Powered by <span className="font-bold text-accent">Gnosis Chain</span>
					</p>
				</div>
			</div>
		</div>
	);
}
