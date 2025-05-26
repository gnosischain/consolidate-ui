import { useState } from 'react';
import { computeSelfConsolidations, Consolidation } from '../hooks/useConsolidate';
import { Withdrawal } from '../hooks/useWithdraw';
import { ValidatorInfo } from '../types/validators';
import { ValidatorBadge } from './ValidatorBadge';
import Withdraw from './Withdraw';

interface ValidatorItemProps {
	validator: ValidatorInfo;
	consolidateValidators: (consolidations: Consolidation[]) => Promise<void>;
	withdrawalValidators: (withdrawal: Withdrawal[]) => Promise<void>;
}

export function ValidatorItem({
	validator,
	consolidateValidators,
	withdrawalValidators,
}: ValidatorItemProps) {
	const [showActions, setShowActions] = useState(false);
	return (
		<tr key={validator.index} className="group">
			{/* <th>
				<input type="checkbox" />
			</th> */}
			<td>{validator.index}</td>
			<td>{validator.type}</td>
			<td>
				<ValidatorBadge filterStatus={validator.filterStatus} status={validator.status} />
			</td>
			<td>{validator.balanceEth} GNO</td>

			<td>
				<div className={`flex rounded-md transition-all duration-300 ${showActions ? 'bg-base-200' : ''}`}>
					<button className="btn btn-ghost btn-circle btn-sm" onClick={() => setShowActions(!showActions)}>
						<img src={showActions ? "/xmark.svg" : "/ellipsis-vertical.svg"} alt="Actions" className="w-5 h-5" />
					</button>
					{showActions && (
						<>
							<button className="btn btn-ghost btn-circle btn-sm"><img src="/deposit.svg" alt="Deposit" className="w-4 h-4" /></button>
							<Withdraw validator={validator} withdrawalValidators={withdrawalValidators} />
							{validator.type === 1 && (
								<button
									className="btn btn-ghost btn-circle btn-sm"
									onClick={() => consolidateValidators(computeSelfConsolidations([validator]))}
								>
									<img src="/upgrade.svg" alt="Upgrade" className="w-5 h-5" />
								</button>
							)}
						</>
					)} </div>
			</td>
		</tr>
	);
}
