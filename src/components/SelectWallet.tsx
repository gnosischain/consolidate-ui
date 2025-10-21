'use client';

import { useRef, useEffect, useState } from 'react';
import { gnosis } from 'viem/chains';
import { Connector, useConnect } from 'wagmi';

export function SelectWallet() {
	const [isMounted, setIsMounted] = useState(false);
	const { connectors, connect } = useConnect();
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const uniqueConnectors = connectors.reduce<Connector[]>((acc, connector) => {
		const names = acc.map((c) => c.name);
		if (!names.includes(connector.name)) {
			acc.push(connector);
		}
		return acc;
	}, []);

	const acceptedConnectors = ['metamask', 'safe', 'rabby wallet'];

	return (
		<>
			<button className="btn btn-primary" onClick={() => dialogRef.current?.showModal()}>
				Connect Wallet
			</button>
			<dialog ref={dialogRef} className="modal">
				<div className="modal-box">
					<h1 className="text-2xl font-bold">Select Wallet</h1>
					<p className="text-xs text-warning text-left mb-4">
						We recommand to use a wallet supporting batch transaction before proceeding.
					</p>
					<div className="list gap-y-2">
						{isMounted ? uniqueConnectors.map((connector) => {
							return (
								<button
									className="list-row flex w-full justify-between items-center btn"
									key={connector.uid}
									onClick={() =>
										connect({
											connector: connector,
											chainId: gnosis.id,
										})
									}
								>
									{connector.name}
									{connector.name.toLowerCase() === 'safe' ? (<a href='https://app.safe.global/' target="_blank" rel="noopener noreferrer" className="text-xs flex items-center text-black/50">Open via Safe UI <img src='/external.svg' className='w-3 h-3 ml-1'/></a>) : null}
									{connector.name.toLowerCase() === 'rabby wallet' ? (<span className="badge badge-xs badge-warning">Batch with safe</span>) : null}
									{!acceptedConnectors.includes(connector.name.toLowerCase()) ? (
										<span className="badge badge-xs badge-warning">Not support batch</span>
									) : null}
								</button>
							);
						}) : (
							<div className="flex justify-center p-4">
								<div className="loading loading-spinner loading-sm"></div>
								<span className="ml-2">Loading wallets...</span>
							</div>
						)}
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</>
	);
}
