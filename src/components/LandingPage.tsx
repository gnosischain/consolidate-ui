import { Boldonse } from "next/font/google";
import Image from "next/image";

const boldonse = Boldonse({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
});

export default function LandingPage() {
	return (
		<div className="w-full min-h-screen">

			{/* Content */}
			<div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">

				{/* Hero Title */}
				<div className="flex flex-col items-center justify-center mb-16">
					<Image src="/gnosis-purple.svg" alt="Gnosis" width={600} height={600} />
					<h1 className={`text-6xl md:text-8xl lg:text-9xl font-bold mb-8 text-accent ${boldonse.className}`}>
						VALIDATORS
					</h1>
					<p className="text-xl md:text-2xl text-base-content/70 max-w-2xl mx-auto font-medium">
						Manage your validators with powerful batch operations
					</p>
				</div>

				{/* CTA Button */}
				<div className="mb-20">
					<div className="inline-flex items-center gap-3 px-8 py-4 bg-base-100 rounded-full border-2 border-primary/30 hover:border-primary/50 transition-all shadow-lg hover:shadow-xl">
						<span className="text-lg font-semibold text-base-content">Connect your wallet to get started</span>
						<svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</div>
				</div>

				{/* Features */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
					<div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-6 border border-base-300 hover:border-primary/30 transition-all">
						<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
							<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
							</svg>
						</div>
						<h3 className="text-lg font-bold mb-2 text-base-content">Batch Operations</h3>
						<p className="text-base-content/60 text-sm">Execute multiple validator actions in a single transaction</p>
					</div>

					<div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-6 border border-base-300 hover:border-accent/30 transition-all">
						<div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
							<svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h3 className="text-lg font-bold mb-2 text-base-content">Fast & Efficient</h3>
						<p className="text-base-content/60 text-sm">Consolidate, withdraw, and manage validators with ease</p>
					</div>

					<div className="bg-base-100/80 backdrop-blur-sm rounded-2xl p-6 border border-base-300 hover:border-primary/30 transition-all">
						<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
							<svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
							</svg>
						</div>
						<h3 className="text-lg font-bold mb-2 text-base-content">Non-Custodial</h3>
						<p className="text-base-content/60 text-sm">Your keys, your control. Direct wallet integration</p>
					</div>
				</div>

				{/* Footer Note */}
				<div className="mt-16 text-center">
					<p className="text-sm text-base-content/50">
						Powered by Gnosis Chain
					</p>
				</div>
			</div>
		</div>
	);
}
