import { computeSelfConsolidations } from '../hooks/useConsolidate';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';
import { ValidatorInfo } from '../types/validators';
import { ValidatorBadge } from './ValidatorBadge';
import Withdraw from './Withdraw';
import { formatEther, parseEther } from 'viem';
import PartialDeposit from './PartialDeposit';
import { ArrowDownToLine, ArrowUp, ArrowUpFromLine, TriangleAlert } from 'lucide-react';
import { useModal } from '../context/ModalContext';

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
	const { consolidateValidators } = useConsolidateValidatorsBatch();
	return (
		<tr className={`h-14 hover:bg-primary/5 group transition-all duration-200 border-b border-base-content/5 ${isSelected ? 'bg-primary/10' : ''
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
			<td className="font-medium">{validator.index}</td>
			<td>
				<span className='badge badge-sm badge-ghost'>
					Type {validator.type}
				</span>
			</td>
			<td>
				<ValidatorBadge filterStatus={validator.filterStatus} status={validator.status} />
			</td>
		<td className="font-semibold">
			<div className="flex items-center gap-2">
				<span>{(Math.floor(Number(formatEther(validator.balanceEth)) * 100) / 100).toFixed(2)} <span className="text-xs text-base-content/60">GNO</span></span>
				{validator.balanceEth < parseEther('1') && validator.filterStatus !== 'exited' && (
					<div className="badge badge-xs badge-soft badge-warning">
						Low
					</div>
				)}
			</div>
		</td>

			<td className="min-w-24">
				{validator.filterStatus === 'active' && (
					<div className="flex rounded-md max-w-fit transition-all duration-300 opacity-0 group-hover:opacity-100">
						{validator.type === 1 && (
							<div className="tooltip" data-tip="Upgrade">
								<button
									className="btn btn-ghost btn-circle btn-sm"
									onClick={() => consolidateValidators(computeSelfConsolidations([validator]))}
								>
									<ArrowUp className="w-4 h-4" />
								</button>
							</div>
						)}

						{validator.type === 2 && (
							<div className="tooltip" data-tip="Deposit">
								<button className="btn btn-ghost btn-circle btn-sm" onClick={() => openModal(<PartialDeposit validator={validator} />)}><ArrowDownToLine className="w-4 h-4" /></button>
							</div>
						)}

						<div className="tooltip" data-tip="Withdraw">
							<button className="btn btn-ghost btn-circle btn-sm" onClick={() => openModal(<Withdraw validator={validator} />)}><ArrowUpFromLine className="w-4 h-4" /></button>
						</div>
					</div>)}
			</td>
		</tr>
	);
}
