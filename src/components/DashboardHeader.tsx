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
		<div className="bg-base-100 rounded-box mb-10 flex w-full flex-col gap-6 p-6 shadow-xs backdrop-blur-sm md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-x-8">
			<div className="flex flex-col gap-6 md:flex-row md:flex-wrap md:gap-x-10 md:gap-y-6">
				{/* Wallet */}
				<div className="border-base-content/10 flex flex-col gap-4 border-b pb-6 md:border-r md:border-b-0 md:pr-10 md:pb-0">
					<div className="flex flex-col gap-1">
						<span className="text-base-content/60 text-sm font-medium">GNO Balance</span>
						<span className="text-base-content text-3xl font-bold">
							{Number(formatEther(walletBalance)).toFixed(2)} GNO
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-base-content/50 text-xs">Active validators</span>
						<span className="text-base-content/90 font-semibold">{activeValidatorsCount}</span>
					</div>
				</div>

				{/* Staking */}
				<div className="border-base-content/10 flex flex-col gap-4 border-b pb-6 md:border-r md:border-b-0 md:pr-10 md:pb-0">
					<div className="flex flex-col gap-1">
						<span className="text-base-content/60 text-sm font-medium">Total staked</span>
						<span className="text-base-content text-3xl font-bold">
							{Number(formatEther(totalBalance)).toFixed(2)} GNO
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-base-content/50 text-xs">Effective balance</span>
						<span className="text-base-content/90 font-semibold">
							{Number(formatEther(totalEffectiveBalance)).toFixed(2)} GNO
						</span>
					</div>
				</div>

				{/* Rewards */}
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-1">
						<span className="text-base-content/60 text-sm font-medium">Ready to claim</span>
						<div className="flex items-center gap-2">
							<span className="text-base-content text-3xl font-bold">
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
						<span className="text-base-content/50 text-xs">Est. Daily Yield</span>
						<span className="text-base-content/90 font-semibold">
							+ {dailyYield} GNO
							<span className="text-base-content/50 ml-1 text-xs">
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
				<Plus className="h-4 w-4" />
				Add Validator
			</button>
		</div>
	);
}
