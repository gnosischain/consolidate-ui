import { ValidatorInfo } from '../types/validators';
import { truncateAddress } from '../utils/address';

interface ValidatorListProps {
	validators: ValidatorInfo[];
	actionLabel?: string;
	onAction?: (v: ValidatorInfo) => void;
}

export function ValidatorList2({ validators, actionLabel, onAction }: ValidatorListProps) {
	return (
		<div className="overflow-x-auto max-h-60">
			<table className="table">
				{/* head */}
				<thead>
					<tr>
						<th></th>
						<th>Address</th>
						<th>Type</th>
						<th>Status</th>
						<th>Balance</th>
					</tr>
				</thead>
				<tbody>
					{validators.map((v) => (
						<tr key={v.index}>
							<th>
								<input type="checkbox" />
							</th>
							<td>{truncateAddress(v.withdrawal_credentials)}</td>
							<td>{v.type}</td>
							<td>{v.status}</td>
							<td>{v.balanceEth} GNO</td>
							{actionLabel && onAction && (
								<button className="btn btn-sm btn-ghost" onClick={() => onAction(v)}>
									{actionLabel}
								</button>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
