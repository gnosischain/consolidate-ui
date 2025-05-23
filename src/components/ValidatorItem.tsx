import { ValidatorInfo } from '../types/validators';
import { truncateAddress } from '../utils/address';

interface ValidatorListProps {
	validator: ValidatorInfo;
	actionLabel?: string;
	onAction?: (v: ValidatorInfo) => void;
}

export function ValidatorItem({ validator, actionLabel, onAction }: ValidatorListProps) {
	return (
		<tr key={validator.index}>
			<th>
				<input type="checkbox" />
			</th>
			<td>{truncateAddress(validator.withdrawal_credentials)}</td>
			<td>{validator.type}</td>
			<td>{validator.status}</td>
			<td>{validator.balanceEth} GNO</td>
			{actionLabel && onAction && (
				<button className="btn btn-sm btn-ghost" onClick={() => onAction(validator)}>
					{actionLabel}
				</button>
			)}
		</tr>
	);
}
