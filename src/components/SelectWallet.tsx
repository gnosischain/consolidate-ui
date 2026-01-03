'use client';

import { ExternalLink } from 'lucide-react';
import { gnosis } from 'viem/chains';
import { Connector, useConnect } from 'wagmi';

export function SelectWallet() {
	const { connectors, connect } = useConnect();

	const uniqueConnectors = connectors.reduce<Connector[]>((acc, connector) => {
		const names = acc.map((c) => c.name);
		if (!names.includes(connector.name)) {
			acc.push(connector);
		}
		return acc;
	}, []);

	const acceptedConnectors = ['metamask', 'rabby wallet'];

	return (
		<div className="flex flex-col md:flex-row md:min-h-[340px] w-full max-w-[640px] rounded-box overflow-hidden">
			{/* Sidebar - hidden on mobile */}
			<div className="hidden md:flex flex-col justify-between p-5 bg-primary md:w-[200px] shrink-0">
				<div>
					<h2 className="text-xl font-bold text-primary-content mb-4">
						Connect Wallet
					</h2>
					<p className="text-sm text-primary-content/80 leading-relaxed">
						Select a wallet to sign in to the application.
					</p>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-col p-6 bg-base-100 flex-1">
				{/* Mobile title */}
				<h2 className="md:hidden text-xl font-bold mb-4">Connect Wallet</h2>

				<h3 className="text-sm font-semibold text-primary mb-3">
					Available Wallets ({uniqueConnectors.length})
				</h3>

				{/* Wallet List */}
				<div className="flex flex-col gap-2 flex-1">
					{
						uniqueConnectors.map((connector) => (
							<button
								className="flex items-center gap-3 px-3 py-2.5 bg-primary/20 hover:bg-primary/30 active:bg-primary/40 border border-primary/30 rounded-lg transition-all w-full"
								key={connector.uid}
								onClick={() =>
									connect({
										connector: connector,
										chainId: gnosis.id,
									})
								}
							>
								{/* Icon */}
								<div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
									{connector.icon ? (
										<img
											src={connector.icon}
											alt={connector.name}
											className="w-6 h-6 object-contain"
										/>
									) : (
										<span className="text-primary font-bold">
											{connector.name.charAt(0).toUpperCase()}
										</span>
									)}
								</div>

								{/* Name */}
								<span className="text-base-content font-medium text-sm">
									{connector.name}
								</span>

								{/* Warning badge */}
								{!acceptedConnectors.includes(connector.name.toLowerCase()) && (
									<span className="ml-auto text-[10px] px-1.5 py-0.5 bg-warning/20 text-warning rounded font-medium">
										No batch
									</span>
								)}
							</button>
						))}
				</div>

				{/* Safe UI Note */}
				<div className="pt-3 border-t border-base-300">
					<a 
						className="text-[11px] text-base-content/40 hover:text-base-content/60 transition-colors inline-flex items-center gap-1" 
						href="https://app.safe.global/"
						target="_blank"
						rel="noopener noreferrer"
					>
						Also available from the Safe UI <ExternalLink className="w-3 h-3" />
					</a>
				</div>
			</div>
		</div>
	);
}
