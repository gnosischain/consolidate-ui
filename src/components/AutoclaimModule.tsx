import { useCallback, useMemo } from 'react';
import { Settings, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useWallet } from '../context/WalletContext';
import { useModal } from '../context/ModalContext';
import useAutoclaim from '../hooks/useAutoclaim';
import { AutoclaimView } from './AutoclaimView';
import { truncateAddress } from '../utils/address';
import { ZERO_ADDRESS } from '../constants/misc';
import { isAddressEqual } from 'viem/utils';

export function AutoclaimModule() {
	const { account, network, isMounted } = useWallet();
	const { openModal } = useModal();
	const { isRegistered, actionContract } = useAutoclaim(network, account.address);

	const actionContractLabel = useMemo(() => {
		if (!actionContract || isAddressEqual(actionContract, ZERO_ADDRESS)) {
			return 'Enabled';
		}
		if (
			network?.payClaimActionAddress &&
			isAddressEqual(actionContract, network.payClaimActionAddress)
		) {
			return 'Gnosis Pay';
		}
		return truncateAddress(actionContract);
	}, [actionContract, network?.payClaimActionAddress]);

	const autoclaimStatus = useMemo(() => {
		const defaultIcon = <Settings className="w-4 h-4 text-base-content/40" />;

		// Return consistent default during SSR to avoid hydration mismatch
		if (!isMounted) {
			return {
				status: 'AUTOCLAIM INACTIVE',
				detail: 'Setup Autoclaim',
				icon: defaultIcon,
			};
		}

		if (!network?.claimRegistryAddress) {
			return {
				status: 'AUTOCLAIM UNAVAILABLE',
				detail: 'Switch Network',
				icon: defaultIcon,
			};
		}

		if (isRegistered) {
			const isGnosisPay = actionContractLabel === 'Gnosis Pay';
			return {
				status: 'AUTOCLAIM ACTIVE',
				detail: actionContractLabel,
				icon: isGnosisPay ? (
					<div className="bg-black h-6 w-16 rounded-lg flex items-center justify-center px-1">
						<Image
							src="/gnosis-pay.svg"
							alt="Gnosis Pay"
							width={40}
							height={40}
							className="w-full h-full object-contain"
						/>
					</div>
				) : (
					defaultIcon
				),
			};
		}

		return {
			status: 'AUTOCLAIM INACTIVE',
			detail: 'Setup Autoclaim',
			icon: defaultIcon,
		};
	}, [actionContractLabel, isMounted, isRegistered, network?.claimRegistryAddress]);

	const isAvailable = isMounted && Boolean(network?.claimRegistryAddress) && Boolean(account.address);

	const handleOpenAutoclaim = useCallback(() => {
		if (!network?.claimRegistryAddress || !account.address) return;
		openModal(<AutoclaimView network={network} address={account.address} />);
	}, [account.address, network, openModal]);

	return (
		<button
			type="button"
			onClick={handleOpenAutoclaim}
			disabled={!isAvailable}
			className={`group w-full text-left rounded-lg p-3 flex flex-col gap-y-2 transition-colors ${isAvailable ? 'cursor-pointer hover:bg-base-200/50' : 'cursor-not-allowed'}`}
		>
			<div className="flex items-center justify-between">
				<span className="text-[10px] font-bold tracking-widest text-base-content/40">
					AUTOCLAIM MODULE
				</span>
				<div className={`status ${isRegistered ? 'status-success' : ''}`} />
			</div>

			<div className="flex items-center gap-3">
				<div
					className={`p-2 rounded-lg transition-colors duration-200 ${isRegistered ? '' : 'bg-base-200/50 text-base-content/40 group-hover:bg-base-200 group-hover:text-base-content/60'}`}
				>
					{autoclaimStatus.icon}
				</div>
				<div className="flex flex-col">
					<span
						className={`font-bold text-sm leading-tight transition-colors duration-200 ${isRegistered ? 'text-base-content' : 'text-base-content/60 group-hover:text-base-content'}`}
					>
						{autoclaimStatus.detail}
					</span>
					<span className="text-[10px] font-medium text-base-content/50">
						{autoclaimStatus.status}
					</span>
				</div>
				<ChevronRight className="w-4 h-4 ml-auto text-base-content/20 group-hover:text-base-content/40 group-hover:translate-x-0.5 transition-all" />
			</div>

			<p className="text-[10px] text-base-content/40 leading-relaxed">
				{isRegistered
					? 'Rewards sent to wallet automatically.'
					: 'Configure automatic reward claiming.'}
			</p>
		</button>
	);
}
