import { ValidatorStatus } from '../types/beacon';
import { FilterStatus } from '../types/validators';

export const STATUS_TO_FILTER: Record<ValidatorStatus, FilterStatus> = {
	pending_initialized: FilterStatus.PENDING,
	pending_queued: FilterStatus.PENDING,
	deposited: FilterStatus.PENDING,
	active_ongoing: FilterStatus.ACTIVE,
	active_online: FilterStatus.ACTIVE,
	active_slashed: FilterStatus.ACTIVE,
	active_offline: FilterStatus.ACTIVE,
	active_exiting: FilterStatus.ACTIVE,
	withdrawal_possible: FilterStatus.ACTIVE,
};
