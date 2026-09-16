import { ValidatorStatus } from '../types/beacon';
import { FilterStatus } from '../types/validators';

type BadgeColor = 'info' | 'success' | 'warning' | 'error' | 'neutral';

const STATUS_TO_BADGE: Record<ValidatorStatus, [BadgeColor, string]> = {
	pending_initialized: ['info', 'Pending Initialized'],
	pending_queued: ['info', 'Pending Queued'],
	deposited: ['info', 'Deposited'],
	active_ongoing: ['info', 'Active Ongoing'],
	active_online: ['success', 'Active Online'],
	active_slashed: ['error', 'Active Slashed'],
	active_offline: ['warning', 'Active Offline'],
	active_exiting: ['info', 'Exiting'],
	exited_unslashed: ['neutral', 'Exited'],
	exited_slashed: ['error', 'Exited Slashed'],
	withdrawal_possible: ['neutral', 'Withdrawal Possible'],
	withdrawal_done: ['neutral', 'Withdrawn'],
};

const COLOR_TO_CLASS: Record<BadgeColor, string> = {
	info: 'status-info',
	success: 'status-success',
	warning: 'status-warning',
	error: 'status-error',
	neutral: 'status-neutral',
};

interface ValidatorBadgeProps {
	filterStatus: FilterStatus;
	status: ValidatorStatus;
}

export function ValidatorBadge({ filterStatus, status }: ValidatorBadgeProps) {
	// A status this build does not know yet must not crash the row.
	const [color, text] = STATUS_TO_BADGE[status] ?? ['neutral', status];
	return (
		<div className="tooltip tooltip-right" data-tip={text}>
			<div className="flex items-center gap-x-2">
				<p className="capitalize">{filterStatus}</p>
				<div className={`status ${COLOR_TO_CLASS[color]}`} />
			</div>
		</div>
	);
}
