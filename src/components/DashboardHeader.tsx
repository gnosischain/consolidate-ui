import { formatEther } from 'viem';
import { Plus } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import Deposit from './Deposit';

interface DashboardHeaderProps {
	walletBalance: bigint;
	totalBalance: bigint;
	totalEffectiveBalance: bigint;
	currentYield: number | null;
	yieldLoading: boolean;
	activeValidatorsCount: number;
	claimBalance: bigint;
	claim: () => void;
}

export default function DashboardHeader({
	walletBalance,
	totalBalance,
	totalEffectiveBalance,
	currentYield,
	yieldLoading,
	activeValidatorsCount,
	claimBalance,
	claim,
}: DashboardHeaderProps) {
	const { openModal } = useModal();

	const dailyYield = currentYield
		? ((currentYield * Number(formatEther(totalEffectiveBalance))) / 100 / 365).toFixed(4)
		: '0.00';

	return (
		<div className="flex flex-col gap-6 p-6 w-full bg-base-100 backdrop-blur-sm rounded-box shadow-xs mb-10 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-x-8">
			<div className="flex flex-col gap-6 md:flex-row md:flex-wrap md:gap-x-10 md:gap-y-6">
				{/* Wallet */}
				<div className="flex flex-col gap-4 border-base-content/10 pb-6 border-b md:pb-0 md:border-b-0 md:pr-10 md:border-r">
					<div className="flex flex-col gap-1">
						<span className="text-sm font-medium text-base-content/60">GNO Balance</span>
						<span className="text-3xl font-bold text-base-content">
							{Number(formatEther(walletBalance)).toFixed(2)} GNO
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-xs text-base-content/50">Active validators</span>
						<span className="font-semibold text-base-content/90">{activeValidatorsCount}</span>
					</div>
				</div>

				{/* Staking */}
				<div className="flex flex-col gap-4 border-base-content/10 pb-6 border-b md:pb-0 md:border-b-0 md:pr-10 md:border-r">
					<div className="flex flex-col gap-1">
						<span className="text-sm font-medium text-base-content/60">Total staked</span>
						<span className="text-3xl font-bold text-base-content">
							{Number(formatEther(totalBalance)).toFixed(2)} GNO
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-xs text-base-content/50">Effective balance</span>
						<span className="font-semibold text-base-content/90">
							{Number(formatEther(totalEffectiveBalance)).toFixed(2)} GNO
						</span>
					</div>
				</div>

				{/* Rewards */}
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<span className="text-sm font-medium text-base-content/60">Ready to claim</span>
						<div className="flex items-center gap-2">
							<span className="text-3xl font-bold text-base-content">
								{Number(formatEther(claimBalance)).toFixed(2)} GNO
							</span>
							<button
								className="btn btn-primary btn-sm"
								onClick={claim}
								disabled={claimBalance === 0n}
							>
								Claim
							</button>
						</div>
					</div>
					<div className="flex flex-col">
						<span className="text-xs text-base-content/50">Est. Daily Yield</span>
						<span className="font-semibold text-base-content/90">
							+ {dailyYield} GNO
							<span className="text-xs text-base-content/50 ml-1">
								{yieldLoading ? '...' : currentYield ? `${currentYield.toFixed(2)}%` : '0.00%'} APY
							</span>
						</span>
					</div>
				</div>
			</div>

			<button
				className="btn btn-accent btn-sm w-full md:w-auto"
				onClick={() => openModal(<Deposit />)}
			>
				<Plus className="w-4 h-4" />
				Add Validator
			</button>
		</div>
	);
}
