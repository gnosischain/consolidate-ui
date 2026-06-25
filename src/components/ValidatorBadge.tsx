import { ValidatorStatus } from '../types/beacon';
import { FilterStatus } from '../types/validators';

const STATUS_TO_BADGE: Record<ValidatorStatus, [string, string]> = {
	pending_initialized: ['info', 'Pending Initialized'],
	pending_queued: ['info', 'Pending Queued'],
	deposited: ['info', 'Deposited'],
	active_ongoing: ['info', 'Active Ongoing'],
	active_online: ['success', 'Active Online'],
	active_slashed: ['error', 'Active Slashed'],
	active_offline: ['warning', 'Active Offline'],
	active_exiting: ['info', 'Exiting'],
	withdrawal_possible: ['info', 'Withdrawal Possible'],
};

interface ValidatorBadgeProps {
	filterStatus: FilterStatus;
	status: ValidatorStatus;
}

export function ValidatorBadge({ filterStatus, status }: ValidatorBadgeProps) {
	const [color, text] = STATUS_TO_BADGE[status];
	return (
		<div className="tooltip tooltip-right" data-tip={text}>
			<div className="flex items-center gap-x-2">
				<p className="capitalize">{filterStatus}</p>
				<div
					className={`status ${color === 'info' ? 'status-info' : ''} ${color === 'success' ? 'status-success' : ''} ${color === 'warning' ? 'status-warning' : ''} ${color === 'error' ? 'status-error' : ''} ${color === 'neutral' ? 'status-neutral' : ''} `}
				/>
			</div>
		</div>
	);
}
