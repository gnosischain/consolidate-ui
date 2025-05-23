import { computeSelfConsolidations, Consolidation } from '../hooks/useConsolidate';
import { Withdrawal } from '../hooks/useWithdraw';
import { ValidatorInfo } from '../types/validators';
import { ValidatorBadge } from './ValidatorBadge';

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
	return (
		<tr key={validator.index}>
			<th>
				<input type="checkbox" />
			</th>
			<td>{validator.index}</td>
			<td>{validator.type}</td>
			<td>
				<ValidatorBadge filterStatus={validator.filterStatus} status={validator.status} />
			</td>
			<td>{validator.balanceEth} GNO</td>

			<td>
				<div className="dropdown dropdown-end">
					<div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm">
						<img src="/ellipsis-vertical.svg" alt="Actions" className="w-5 h-5" />
					</div>
					<ul
						tabIndex={0}
						className="dropdown-content menu bg-base-100 rounded-box z-10 overflow-visible w-36 p-2 shadow-sm"
					>
						<li>
							<button className="btn btn-ghost">Deposit</button>
						</li>
						<li>
							<button
								className="btn btn-ghost"
								onClick={() =>
									withdrawalValidators([
										{
											pubkey: validator.pubkey,
											amount: 2,
										},
									])
								}
							>
								Exit
							</button>
						</li>
						{validator.type === 1 && (
							<li>
								<button
									className="btn btn-ghost"
									onClick={() => consolidateValidators(computeSelfConsolidations([validator]))}
								>
									Upgrade
								</button>
							</li>
						)}
					</ul>
				</div>
			</td>
		</tr>
	);
}
