import { ValidatorInfo } from '../types/validators';
import { ValidatorBadge } from './ValidatorBadge';

interface ValidatorItemProps {
	validator: ValidatorInfo;
	actionLabel?: string;
	onAction?: (v: ValidatorInfo) => void;
}

export function ValidatorItem({ validator, actionLabel, onAction }: ValidatorItemProps) {
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
			{actionLabel && onAction && (
				<td>
					<button className="btn btn-sm btn-ghost" onClick={() => onAction(validator)}>
						{actionLabel}
					</button>
				</td>
			)}
		</tr>
	);
}
