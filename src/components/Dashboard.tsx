import { useEffect, useMemo, useState } from 'react';
import { ValidatorsTable } from './ValidatorsTable';
import { useBeaconValidators } from '../hooks/useBeaconValidators';
import { useWallet } from '../context/WalletContext';
import { WarningModal } from './WarningModal';
import { BatchInfo } from './BatchInfo';
import DashboardHeader from './DashboardHeader';
import { AlertTriangle } from 'lucide-react';

export default function Dashboard() {
	const { account, network, isMounted, canBatch, canBatchLoading, nativeBalance, balance } =
		useWallet();

	const { validators } = useBeaconValidators(network, account.address);

	const hasNoXdai = isMounted && account.isConnected && nativeBalance === 0n;

	const totalBalance = useMemo(() => {
		return validators
			.filter((v) => v.filterStatus === 'active')
			.reduce((acc, v) => acc + v.balance, 0n);
	}, [validators]);

	const totalEffectiveBalance = useMemo(() => {
		return validators
			.filter((v) => v.filterStatus === 'active')
			.reduce((acc, v) => acc + v.effectiveBalance, 0n);
	}, [validators]);

	const [currentYield, setCurrentYield] = useState<number | null>(null);
	const [yieldLoading, setYieldLoading] = useState(true);

	useEffect(() => {
		const fetchYield = async () => {
			try {
				const response = await fetch(
					'https://api.analytics.gnosis.io/v1/consensus/validators_apy/latest',
				);
				if (!response.ok) {
					throw new Error('Failed to fetch yield data');
				}
				const data = await response.json();
				const yieldValue = data?.[0]?.value ?? null;
				setCurrentYield(yieldValue);
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
		<div className="flex flex-col w-full">
			{isMounted && network && <WarningModal totalBalance={totalBalance} network={network} />}
			{isMounted && account.isConnected && (
				<BatchInfo canBatch={canBatch} canBatchLoading={canBatchLoading} />
			)}
			{hasNoXdai && (
				<div className="flex items-center gap-2 text-xs text-base-content/50 mb-4 px-1">
					<AlertTriangle className="w-3.5 h-3.5 text-warning/70 shrink-0" />
					<span>No xDAI detected in your wallet — a small amount is needed to pay EL fees for consolidations and withdrawals.</span>
				</div>
			)}
			<DashboardHeader
				walletBalance={balance.balance}
				totalBalance={totalBalance}
				totalEffectiveBalance={totalEffectiveBalance}
				currentYield={currentYield}
				yieldLoading={yieldLoading}
				activeValidatorsCount={validators.filter((v) => v.filterStatus === 'active').length}
				claimBalance={balance.claimBalance}
				claim={balance.claim}
			/>
			<ValidatorsTable validators={validators} />
		</div>
	);
}
