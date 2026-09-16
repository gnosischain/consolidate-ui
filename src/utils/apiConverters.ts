import { Address, parseGwei } from 'viem';
import { APIValidatorInfo } from '../types/api';
import { BeaconChainResponse } from '../types/beacon';
import { CredentialType, FilterStatus, ValidatorInfo } from '../types/validators';
import { STATUS_TO_FILTER } from './status';

function credentialType(withdrawalCredentials: string): CredentialType {
	if (withdrawalCredentials.startsWith('0x02')) return 2;
	if (withdrawalCredentials.startsWith('0x01')) return 1;
	return 0;
}

/**
 * Convert a beacon API validator entry to the JSON-safe API shape.
 * `multiplier` is the CL-to-token ratio (32 on Gnosis: 1 GNO is 32 CL "ETH").
 */
export function beaconToAPIValidatorInfo(
	v: BeaconChainResponse,
	multiplier: bigint,
): APIValidatorInfo {
	const creds = v.validator.withdrawal_credentials;
	return {
		index: Number(v.index),
		pubkey: v.validator.pubkey,
		balance: (parseGwei(v.balance) / multiplier).toString(),
		effectiveBalance: (parseGwei(v.validator.effective_balance) / multiplier).toString(),
		withdrawal_credentials: creds,
		type: credentialType(creds),
		status: v.status,
		filterStatus: STATUS_TO_FILTER[v.status],
		slashed: v.validator.slashed,
		activationEpoch: v.validator.activation_epoch,
		exitEpoch: v.validator.exit_epoch,
		withdrawableEpoch: v.validator.withdrawable_epoch,
	};
}

/**
 * Convert API response ValidatorInfo to domain ValidatorInfo
 */
export function apiToValidatorInfo(apiValidator: APIValidatorInfo): ValidatorInfo {
	return {
		index: apiValidator.index,
		pubkey: apiValidator.pubkey as Address,
		balance: BigInt(apiValidator.balance), // Convert string back to BigInt
		effectiveBalance: BigInt(apiValidator.effectiveBalance), // Convert string back to BigInt
		withdrawal_credentials: apiValidator.withdrawal_credentials as Address,
		type: apiValidator.type as CredentialType,
		status: apiValidator.status,
		filterStatus: apiValidator.filterStatus as FilterStatus,
		slashed: apiValidator.slashed,
		activationEpoch: BigInt(apiValidator.activationEpoch),
		exitEpoch: BigInt(apiValidator.exitEpoch),
		withdrawableEpoch: BigInt(apiValidator.withdrawableEpoch),
	};
}
