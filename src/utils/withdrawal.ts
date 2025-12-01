import { parseEther } from 'viem';
import { ValidatorInfo, Withdrawal } from '../types/validators';
import { NetworkConfig } from '../types/network';

export interface WithdrawalResult {
	withdrawals: Withdrawal[];
	exits: ValidatorInfo[];
	withdrawalsAmount: bigint;
}

/**
 * Computes withdrawal amounts for validators based on total amount to withdraw
 * @param validators - Array of validator information
 * @param amountToWithdraw - Total amount to withdraw in wei
 * @param totalValidatorBalance - Total balance across all validators
 * @param preventExit - Whether to prevent validator exits (keep minimum balance)
 * @param network - Network configuration for minimum balance
 * @returns Object containing withdrawals, exits, and total withdrawal amount
 */
export function computeWithdrawals(
	validators: ValidatorInfo[],
	amountToWithdraw: bigint,
	totalValidatorBalance: bigint,
	network: NetworkConfig,
	preventExit = true
): WithdrawalResult {
	if (totalValidatorBalance === 0n || amountToWithdraw <= 0n) {
		return { withdrawals: [], exits: [], withdrawalsAmount: 0n };
	}

	const exitBuffer = preventExit ? parseEther(network.cl.minBalance.toString()) : 0n;
	const eligibleValidators = validators.filter(v => v.balance > exitBuffer);

	const withdrawals: Withdrawal[] = [];
	const exits: ValidatorInfo[] = [];

	for (const v of eligibleValidators) {
		const maxWithdrawable = v.balance - BigInt(exitBuffer);
		const proportionalAmount = (v.balance * amountToWithdraw) / totalValidatorBalance;
		let rawAmount = proportionalAmount < maxWithdrawable ? proportionalAmount : maxWithdrawable;

		if (!preventExit) {
			const leftover = v.balance - rawAmount;
			if (leftover > 0 && leftover < parseEther(network.cl.minBalance.toString())) {
				rawAmount = v.balance;
			}
		}

		if (rawAmount > 0) {
			// An exit is triggered by setting amount to 0
			withdrawals.push({ 
				pubkey: v.pubkey, 
				amount: !preventExit && rawAmount === v.balance ? 0n : rawAmount 
			});

			if (!preventExit && rawAmount === v.balance) {
				exits.push(v);
			}
		}
	}

	return {
		withdrawals,
		exits,
		withdrawalsAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0n),
	};
}

