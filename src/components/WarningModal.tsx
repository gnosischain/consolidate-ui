import { useEffect, useRef } from 'react';
import { formatEther } from 'viem';
import { NetworkConfig } from '../types/network';

interface WarningModalProps {
	totalBalance: bigint;
	network: NetworkConfig;
}

export function WarningModal({ 
	totalBalance,
	network
}: WarningModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const balanceNumber = Number(formatEther(totalBalance));
		if (balanceNumber > 10 && dialogRef.current) {
			dialogRef.current.showModal();
		}
	}, [totalBalance]);

	const handleClose = () => {
		dialogRef.current?.close();
	};

	return (
		<dialog ref={dialogRef} className="modal">
			<div className="modal-box">
				<h3 className="text-lg font-bold text-warning">⚠️ Warning</h3>
				<p className="py-4">
					You're holding {Number(formatEther(totalBalance)).toFixed(2)} GNO in the Consensus Layer, this application is in beta and you should proceed with caution.
				</p>
				<ul className="text-sm text-gray-500 list-disc list-inside">
					<li>Review all your transactions before accepting them.</li>
					<li>Monitor your tx on the Beacon Chain: <a href={network.beaconchainApi ?? ''} target="_blank" rel="noopener noreferrer" className="underline ml-1">{network.beaconchainApi ?? ''}</a></li>
					<li>Get help on our Discord: <a href="https://discord.gg/gnosis" target="_blank" rel="noopener noreferrer" className="underline ml-1">https://discord.gg/gnosis</a></li>
				</ul>
				<div className="modal-action">
					<button 
						className="btn btn-primary" 
						onClick={handleClose}
					>
						I understand
					</button>
				</div>
			 </div>
			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={handleClose}>close</button>
			</form>
		</dialog>
	);
} 