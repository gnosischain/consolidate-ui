import { useMemo, useState } from 'react';
import { ValidatorInfo } from '../types/validators';
import { formatEther, parseEther } from 'viem';
import { useWithdraw } from '../hooks/useWithdraw';
import { useWallet } from '../context/WalletContext';
import { TransactionButton } from './TransactionButton';

interface WithdrawProps {
	validators: ValidatorInfo[];
}

export default function WithdrawBatch({ validators }: WithdrawProps) {
	const { network } = useWallet();
	if (!network) {
		throw new Error('Network not found');
	}

	const totalBalance = useMemo(
		() => validators.reduce((acc, v) => acc + v.balance, 0n),
		[validators],
	);

	const { buildWithdrawCalls, computeWithdrawals } = useWithdraw(network);
	const [amount, setAmount] = useState(0);
	const [preventExit, setPreventExit] = useState(true);

	const { withdrawals, exits, withdrawalsAmount } = useMemo(
		() => computeWithdrawals(validators, parseEther(amount.toString()), totalBalance, preventExit),
		[validators, amount, totalBalance, preventExit, computeWithdrawals],
	);

	const calls = useMemo(() => buildWithdrawCalls(withdrawals), [withdrawals, buildWithdrawCalls]);

	return (
		<>
			<h3 className="text-lg font-bold">Batch withdraw</h3>
			<p className="text-sm text-gray-500">
				Balance: {Number(formatEther(totalBalance)).toFixed(2)} GNO
			</p>
			<fieldset className="fieldset mt-2 w-full gap-y-2">
				<legend className="fieldset-legend">
					Withdraw amount{' '}
					<button
						className="btn btn-xs"
						onClick={() => setAmount(Number(formatEther(totalBalance)))}
					>
						Max
					</button>
				</legend>
				<div className="flex items-center gap-x-2">
					<input
						type="checkbox"
						className="checkbox checkbox-xs"
						checked={preventExit}
						onChange={() => setPreventExit(!preventExit)}
					/>
					<p className="text-sm text-gray-500">Prevent exit</p>
				</div>
				<input
					type="number"
					placeholder="Type here"
					className="input input-primary input-sm w-full"
					name="amount"
					max={formatEther(totalBalance)}
					value={amount}
					onChange={(e) => setAmount(Number(e.target.value))}
				/>
			</fieldset>
			<div className="mt-4">
				<p className="text-sm text-gray-500">Withdrawals: {withdrawals.length}</p>
				<p className={`text-sm ${exits.length === 0 ? 'text-gray-500' : 'text-warning'}`}>
					Exits: {exits.length}
				</p>
				<ul className="flex gap-x-2 text-xs">
					{exits.map((exit) => (
						<li key={exit.index}>{exit.index}</li>
					))}
				</ul>
			</div>
			<div className="mt-8 flex w-full justify-end">
				<TransactionButton calls={calls} className="btn btn-primary">
					{'Withdraw ' + Number(formatEther(withdrawalsAmount)).toFixed(2) + ' GNO'}
				</TransactionButton>
			</div>
		</>
	);
}
