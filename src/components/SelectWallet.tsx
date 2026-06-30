'use client';

import { ExternalLink } from 'lucide-react';
import { gnosis } from 'viem/chains';
import { Connector, useConnectors } from 'wagmi';

export function SelectWallet() {
	const connectors = useConnectors();

	const uniqueConnectors = connectors.reduce<Connector[]>((acc, connector) => {
		const names = acc.map((c) => c.name);
		if (!names.includes(connector.name)) {
			acc.push(connector);
		}
		return acc;
	}, []);

	const acceptedConnectors = ['metamask', 'rabby wallet'];

	const availableConnectors = uniqueConnectors.filter((connector) =>
		acceptedConnectors.includes(connector.name.toLowerCase()),
	);

	return (
		<div className="rounded-box flex w-full max-w-[640px] flex-col overflow-hidden md:min-h-[340px] md:flex-row">
			{/* Sidebar - hidden on mobile */}
			<div className="bg-primary hidden shrink-0 flex-col justify-between p-5 md:flex md:w-[200px]">
				<div>
					<h2 className="text-primary-content mb-4 text-xl font-bold">Connect Wallet</h2>
					<p className="text-primary-content/80 text-sm leading-relaxed">
						Select a wallet to sign in to the application.
					</p>
				</div>
			</div>

			{/* Content */}
			<div className="bg-base-100 flex flex-1 flex-col p-6">
				{/* Mobile title */}
				<h2 className="mb-4 text-xl font-bold md:hidden">Connect Wallet</h2>

				<h3 className="text-primary mb-3 text-sm font-semibold">
					Available Wallets ({availableConnectors.length})
				</h3>

				{/* Wallet List */}
				<div className="flex flex-1 flex-col gap-2">
					{availableConnectors.map((connector) => (
						<button
							className="bg-primary/20 hover:bg-primary/30 active:bg-primary/40 border-primary/30 flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-all"
							key={connector.uid}
							onClick={() => connector.connect({ chainId: gnosis.id })}
						>
							{/* Icon */}
							<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
								{connector.icon ? (
									<img
										src={connector.icon}
										alt={connector.name}
										className="h-6 w-6 object-contain"
									/>
								) : (
									<span className="text-primary font-bold">
										{connector.name.charAt(0).toUpperCase()}
									</span>
								)}
							</div>

							{/* Name */}
							<span className="text-base-content text-sm font-medium">{connector.name}</span>
						</button>
					))}
				</div>

				{/* Safe UI Note */}
				<div className="border-base-300 border-t pt-3">
					<a
						className="text-base-content/40 hover:text-base-content/60 inline-flex items-center gap-1 text-[11px] transition-colors"
						href="https://app.safe.global/"
						target="_blank"
						rel="noopener noreferrer"
					>
						Also available from the Safe UI <ExternalLink className="h-3 w-3" />
					</a>
				</div>
			</div>
		</div>
	);
}
