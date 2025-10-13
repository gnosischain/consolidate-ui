import { useState } from 'react';
import { computeSelfConsolidations } from '../hooks/useConsolidate';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';
import { ValidatorInfo } from '../types/validators';
import { ValidatorBadge } from './ValidatorBadge';
import Withdraw from './Withdraw';
import { formatEther } from 'viem';
import PartialDeposit from './PartialDeposit';
import { useWallet } from '../context/WalletContext';
import { EllipsisVertical, X } from 'lucide-react';

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
	const { network } = useWallet();
	if (!network) {
		throw new Error('Network not found');
	}

	const { consolidateValidators } = useConsolidateValidatorsBatch(network.consolidateAddress);
	const [showActions, setShowActions] = useState(false);
	return (
		<tr className={`h-14 hover:bg-primary/5 transition-all duration-200 border-b border-base-content/5 ${
			isSelected ? 'bg-primary/10' : ''
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
			<td className="font-semibold">{Number(formatEther(validator.balanceEth)).toFixed(2)} <span className="text-xs text-base-content/60">GNO</span></td>

			<td className="min-w-24">
				{validator.filterStatus === 'active' && (
					<div className={`flex rounded-md max-w-fit transition-all duration-300 ${showActions ? 'bg-base-200' : ''}`}>
						<button className="btn btn-ghost btn-circle btn-sm" onClick={() => setShowActions(!showActions)}>
							{showActions ? <X className="w-5 h-5" /> : <EllipsisVertical className="w-5 h-5" />}
						</button>
						{showActions && (
							<>

								{validator.type === 1 && (
									<div className="tooltip" data-tip="Upgrade">
										<button
											className="btn btn-ghost btn-circle btn-sm"
											onClick={() => consolidateValidators(computeSelfConsolidations([validator]))}
										>
											<img src="/upgrade.svg" alt="Upgrade" className="w-5 h-5" />
										</button>
									</div>
								)}

								{validator.type === 2 && (
									<div className="tooltip" data-tip="Deposit">
										<PartialDeposit validator={validator} />
									</div>
								)}

								<div className="tooltip" data-tip="Withdraw">
									<Withdraw validator={validator} />
								</div>
							</>
						)} </div>)}
			</td>
		</tr>
	);
}
