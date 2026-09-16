import { ValidatorStatus } from './beacon';
import { FilterStatus } from './validators';

// API Response types (for JSON serialization)
export interface APIValidatorInfo {
	index: number;
	pubkey: string;
	balance: string; // String for JSON serialization
	effectiveBalance: string; // String for JSON serialization
	withdrawal_credentials: string;
	type: number;
	status: ValidatorStatus;
	filterStatus: FilterStatus;
	slashed: boolean;
	// Epochs as decimal strings: FAR_FUTURE_EPOCH (2^64 - 1) does not fit a JS number
	activationEpoch: string;
	exitEpoch: string;
	withdrawableEpoch: string;
}
