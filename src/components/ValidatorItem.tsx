import { useState } from 'react';
import { computeSelfConsolidations } from '../hooks/useConsolidate';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';
import { ValidatorInfo } from '../types/validators';
import { ValidatorBadge } from './ValidatorBadge';
import Withdraw from './Withdraw';
import { formatEther } from 'viem';
import PartialDeposit from './PartialDeposit';
import { useWallet } from '../context/WalletContext';

interface ValidatorItemProps {
	validator: ValidatorInfo;
}

export function ValidatorItem({
	validator,
}: ValidatorItemProps) {
	const { network } = useWallet();
	if (!network) {
		throw new Error('Network not found');
	}
	
	const { consolidateValidators } = useConsolidateValidatorsBatch(network.consolidateAddress);
	const [showActions, setShowActions] = useState(false);
	return (
		<tr key={validator.index}>
			{/* <th>
				<input type="checkbox" />
			</th> */}
			<td>{validator.index}</td>
			<td>{validator.type}</td>
			<td>
				<ValidatorBadge filterStatus={validator.filterStatus} status={validator.status} />
			</td>
			<td>{formatEther(validator.balanceEth)} GNO</td>

			<td className="min-w-24">
				{validator.filterStatus === 'active' && (
					<div className={`flex rounded-md max-w-fit transition-all duration-300 ${showActions ? 'bg-base-200' : ''}`}>
						<button className="btn btn-ghost btn-circle btn-sm" onClick={() => setShowActions(!showActions)}>
							<img src={showActions ? "/xmark.svg" : "/ellipsis-vertical.svg"} alt="Actions" className="w-5 h-5" />
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
									<>
										<div className="tooltip" data-tip="Deposit">
											<PartialDeposit validator={validator} />
										</div>
										<div className="tooltip" data-tip="Withdraw">
											<Withdraw validator={validator} />
										</div>
									</>
								)}
							</>
						)} </div>)}
			</td>
		</tr>
	);
}
