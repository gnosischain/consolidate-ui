import { useCallback } from 'react';
import { encodePacked, formatUnits } from 'viem';

import { Withdrawal, ValidatorInfo } from '../types/validators';
import { NetworkConfig } from '../types/network';
import { TransactionCall } from '../types/transaction';
import { computeWithdrawals } from '../utils/withdrawal';
import { EL_FEE } from '../constants/misc';

export function useWithdraw(network: NetworkConfig) {
	const buildWithdrawCalls = useCallback(
		(withdrawals: Withdrawal[]): TransactionCall[] => {
			return withdrawals.map(({ pubkey, amount }) => ({
				to: network.withdrawalAddress,
				data: encodePacked(
					['bytes', 'uint64'],
					[pubkey, BigInt(formatUnits(amount * network.cl.multiplier, 9))],
				),
				value: EL_FEE,
				title: amount === 0n ? 'Exit' : 'Withdraw',
			}));
		},
		[network],
	);

	return {
		buildWithdrawCalls,
		computeWithdrawals: (
			validators: ValidatorInfo[],
			amountToWithdraw: bigint,
			totalValidatorBalance: bigint,
			preventExit = true,
		) =>
			computeWithdrawals(validators, amountToWithdraw, totalValidatorBalance, network, preventExit),
	};
}
