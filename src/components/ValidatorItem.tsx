import { computeSelfConsolidations } from '../hooks/useConsolidate';
import { ValidatorInfo } from '../types/validators';
import { ValidatorBadge } from './ValidatorBadge';
import Withdraw from './Withdraw';
import { formatEther, parseEther } from 'viem';
import PartialDeposit from './PartialDeposit';
import { ArrowUp, Plus, Minus, ArrowRightLeft } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { truncateAddress } from '../utils/address';
import { CopyButton } from './CopyButton';
import { ConsolidationSummary } from './ConsolidationSummary';

interface ValidatorItemProps {
	validator: ValidatorInfo;
	isSelected: boolean;
	onToggle: (index: number, checked: boolean) => void;
}

export function ValidatorItem({
	validator,
	isSelected,
	onToggle,
}: ValidatorItemProps) {
	const { openModal } = useModal();
	const { pendingInfo } = validator;
	
	return (
		<tr className={`h-14 hover:bg-primary/5 group transition-all duration-200 ${isSelected ? 'bg-primary/10' : ''
			} ${validator.filterStatus === 'active' ? 'text-base-content' : 'text-base-content/50'}`}>
			<th>
				<input
					type="checkbox"
					className="checkbox checkbox-primary checkbox-xs"
					checked={isSelected}
					onChange={(e) => onToggle(validator.index, e.target.checked)}
					disabled={validator.filterStatus !== 'active'}
				/>
			</th>
			<td className="font-mono text-sm opacity-70">
				#{validator.index}
			</td>
			<td>
				<div className="flex items-center gap-2 font-mono text-sm opacity-70">
					{truncateAddress(validator.pubkey)}
					<div className="opacity-0 group-hover:opacity-100 transition-opacity">
						<CopyButton text={validator.pubkey} />
					</div>
				</div>
			</td>
			<td className="font-mono text-sm opacity-70">
				{validator.type === 1 ? 'Standard' : validator.type === 2 ? 'Compounding' : 'Legacy'}
			</td>
			<td>
				<ValidatorBadge filterStatus={validator.filterStatus} status={validator.status} />
			</td>
			<td className="font-semibold">
				<div className="flex items-center gap-2">
					{(Math.floor(Number(formatEther(validator.balance)) * 100) / 100).toFixed(2)}
					<span className="text-xs text-base-content/60">GNO</span>
					{validator.balance < parseEther('1') && validator.filterStatus !== 'exited' && (
						<div className="badge badge-xs badge-soft badge-warning">
							Low
						</div>
					)}
					{/* Pending state indicators */}
					{pendingInfo?.hasPendingWithdrawal && (
						<div
							className="tooltip flex items-center text-warning"
							data-tip={`Withdrawing at epoch ${pendingInfo.withdrawableEpoch}`}
						>
							<span className="text-xs font-medium">
								-{pendingInfo.pendingWithdrawalAmount
									? (Math.floor(Number(formatEther(pendingInfo.pendingWithdrawalAmount)) * 1000) / 1000).toFixed(3)
									: '?'} GNO
							</span>
						</div>
					)}
					{pendingInfo?.hasPendingDeposit && (
						<div className="tooltip" data-tip={`Pending deposit: ${pendingInfo.pendingDepositAmount ? (Math.floor(Number(formatEther(pendingInfo.pendingDepositAmount)) * 1000) / 1000).toFixed(3) : '?'} GNO`}>
							<div className="badge badge-xs badge-soft badge-success gap-1">
								<Plus className="w-3 h-3" />
								Deposit
							</div>
						</div>
					)}
					{pendingInfo?.hasPendingConsolidation && (
						<div className="tooltip" data-tip={
							pendingInfo.isConsolidationSource
								? `Consolidating to validator #${pendingInfo.consolidationTargetIndex}`
								: `Receiving consolidation from validator #${pendingInfo.consolidationSourceIndex}`
						}>
							<div className={`badge badge-xs badge-soft gap-1 ${pendingInfo.isConsolidationSource ? 'badge-warning' : 'badge-primary'}`}>
								<ArrowRightLeft className="w-3 h-3" />
								{pendingInfo.isConsolidationSource ? 'Source' : 'Target'}
							</div>
						</div>
					)}
				</div>
			</td>

			<td className="min-w-24">
				{validator.filterStatus === 'active' && (
					<div className="flex gap-x-1 transition-all duration-300 opacity-40 group-hover:opacity-100">
						{validator.type === 1 && (
							<div className="tooltip" data-tip="Upgrade">
								<button
									className="btn btn-soft btn-secondary btn-circle btn-xs"
									onClick={() => openModal(<ConsolidationSummary consolidations={computeSelfConsolidations([validator])} />)}
								>
									<ArrowUp className="w-4 h-4" />
								</button>
							</div>
						)}

						{validator.type === 2 && (
							<div className="tooltip" data-tip="Deposit">
								<button className="btn btn-soft btn-secondary btn-circle btn-xs" onClick={() => openModal(<PartialDeposit validator={validator} />)}><Plus className="w-4 h-4" /></button>
							</div>
						)}

						<div className="tooltip" data-tip="Withdraw">
							<button className="btn btn-soft btn-secondary btn-circle btn-xs" onClick={() => openModal(<Withdraw validator={validator} />)}><Minus className="w-4 h-4" /></button>
						</div>
					</div>)}
			</td>
		</tr>
	);
}
