'use client';

import { useWallet } from "../context/WalletContext";
import { truncateAddress } from "../utils/address";
import { SelectWallet } from "./SelectWallet";
import { AccountView } from "./AccountView";
import { Menu } from "lucide-react";
import { useModal } from "../context/ModalContext";

export type ModalView = 'main' | 'autoclaim' | 'network' | 'autoclaim-config';

export default function WalletModal() {
	const { account, chainId, chainName, network } = useWallet();
	const { openModal } = useModal();

	return (
		<>
			{account.isConnected && account.address && network && chainId && chainName ? (
				<button
					className="btn btn-soft btn-primary flex items-center gap-2"
					onClick={() => openModal(<AccountView />)}
				>
					<span className="font-medium">{truncateAddress(account.address)}</span>
					<Menu className="w-4 h-4" />
				</button>
			) : (
				<button onClick={() => openModal(<SelectWallet />, { className: 'p-0' })} className="btn btn-secondary">Connect Wallet</button>
			)}
		</>
	);
}