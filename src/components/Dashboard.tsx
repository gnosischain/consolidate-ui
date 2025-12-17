import { useEffect, useMemo, useState, useCallback } from 'react';
import { ValidatorsTable } from './ValidatorsTable';
import { useBeaconValidators } from '../hooks/useBeaconValidators';
import { useWallet } from '../context/WalletContext';
import { WarningModal } from './WarningModal';
import { BatchInfo } from './BatchInfo';
import DashboardHeader from './DashboardHeader';
import { Settings } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import Image from 'next/image';
import useAutoclaim from '../hooks/useAutoclaim';
import { AutoclaimView } from './AutoclaimView';
import { truncateAddress } from '../utils/address';
import { ZERO_ADDRESS } from '../constants/misc';

export default function Dashboard() {
	const { account, network, isMounted, canBatch, canBatchLoading } = useWallet();
	const { openModal } = useModal();
	const { isRegistered, actionContract } = useAutoclaim(network, account.address);

	const { validators } = useBeaconValidators(network, account.address);

	const totalBalance = useMemo(() => {
		return validators.filter(v => v.filterStatus === 'active').reduce((acc, v) => acc + v.balance, 0n);
	}, [validators]);

	const totalEffectiveBalance = useMemo(() => {
		return validators.filter(v => v.filterStatus === 'active').reduce((acc, v) => acc + v.effectiveBalance, 0n);
	}, [validators]);

	const [currentYield, setCurrentYield] = useState<number | null>(null);
	const [yieldLoading, setYieldLoading] = useState(true);

	const actionContractLabel = useMemo(() => {
		if (!actionContract || actionContract?.toLowerCase() === ZERO_ADDRESS.toLowerCase()) {
			return 'Enabled';
		}
		if (network?.payClaimActionAddress && actionContract?.toLowerCase() === network.payClaimActionAddress.toLowerCase()) {
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

		if (network?.claimRegistryAddress) {
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
						<Image src="/gnosis-pay.svg" alt="Gnosis Pay" width={40} height={40} className="w-full h-full object-contain" />
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

	const handleOpenAutoclaim = useCallback(() => {
		if (!network || !account.address) return;
		openModal(<AutoclaimView network={network} address={account.address} />);
	}, [account.address, network, openModal]);

	useEffect(() => {
		const fetchYield = async () => {
			try {
				const response = await fetch('https://dune-proxy.gnosischain.com/current-yield');
				if (!response.ok) {
					throw new Error('Failed to fetch yield data');
				}
				const data = await response.json();
				const yieldValue = data.result.rows[0]?.yield;
				setCurrentYield(yieldValue || null);
			} catch (error) {
				console.error('Error fetching yield:', error);
				setCurrentYield(null);
			} finally {
				setYieldLoading(false);
			}
		};

		fetchYield();
	}, []);

	return (
		<div className='flex flex-col w-full'>
			{isMounted && network && <WarningModal totalBalance={totalBalance} network={network} />}
			{isMounted && account.isConnected && <BatchInfo canBatch={canBatch} canBatchLoading={canBatchLoading} />}
			<DashboardHeader
				totalBalance={totalBalance}
				totalEffectiveBalance={totalEffectiveBalance}
				currentYield={currentYield}
				yieldLoading={yieldLoading}
				activeValidatorsCount={validators.filter(v => v.filterStatus === 'active').length}
				isRegistered={isRegistered}
				autoclaimStatus={autoclaimStatus}
				handleOpenAutoclaim={handleOpenAutoclaim}
			/>
			<ValidatorsTable
				validators={validators}
			/>
		</div>
	);
}
