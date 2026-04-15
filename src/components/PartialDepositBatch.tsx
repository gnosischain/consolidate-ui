import { useMemo, useState } from 'react';
import { ValidatorInfo } from '../types/validators';
import { formatEther, parseEther } from 'viem';
import { useWallet } from '../context/WalletContext';
import useDeposit from '../hooks/useDeposit';
import { useModal } from '../context/ModalContext';
import { TransactionButton } from './TransactionButton';
import { computePartialDepositAmounts } from '../utils/depositCalculations';

interface PartialDepositProps {
	validators: ValidatorInfo[];
}

export default function PartialDepositBatch({ validators }: PartialDepositProps) {
	const { network, balance, account } = useWallet();
	const [targetAmount, setTargetAmount] = useState(network?.cl.minBalance ?? 0);
	const { closeModal } = useModal();

	if (!network || !account.address) {
		throw new Error('Network not found');
	}

	const { buildPartialDepositCalls, onDepositSuccess, allowance } =
		useDeposit(network, account.address);
	const [amount, setAmount] = useState(0n);

	const depositAmounts = useMemo(
		() => computePartialDepositAmounts(amount, validators, BigInt(targetAmount)),
		[validators, amount, targetAmount],
	);

	const totalDepositAmount = useMemo(
		() => depositAmounts.reduce((acc, amt) => acc + amt, 0n),
		[depositAmounts],
	);

	const calls = useMemo(
		() => buildPartialDepositCalls(depositAmounts, validators),
		[depositAmounts, validators, buildPartialDepositCalls],
	);

	const needsApproval = allowance < totalDepositAmount;

	return (
		<>
			<h3 className="text-lg font-bold">Batch top up</h3>
			<p className="text-sm text-gray-500">
				Balance: {Number(formatEther(balance.balance)).toFixed(2)} GNO
			</p>
			<fieldset className="fieldset mt-2 w-full gap-y-2">
				<legend className="fieldset-legend">
					Deposit amount{' '}
					<button className="btn btn-xs" onClick={() => setAmount(balance.balance)}>
						Max
					</button>
				</legend>
				<input
					type="number"
					placeholder="Type here"
					className="input input-primary input-sm w-full"
					name="amount"
					max={formatEther(balance.balance)}
					value={formatEther(amount)}
					onChange={(e) => {
						if (e.target.value === '') { setAmount(0n); return; }
						try {
							const parsed = parseEther(e.target.value);
							setAmount(parsed > balance.balance ? balance.balance : parsed);
						} catch {
							setAmount(0n);
						 }
					}}
				/>
			</fieldset>
			<fieldset className="fieldset mt-2 w-full gap-y-2">
				<legend className="fieldset-legend">Target amount per validator</legend>
				<input
					type="range"
					min={network.cl.minBalance}
					max={network.cl.maxBalance}
					value={targetAmount}
					className="range range-sm range-primary mt-8 w-full"
					onChange={(e) => setTargetAmount(Number(e.target.value))}
				/>
				<div className="flex justify-between w-full">
					<p className="text-xs text-base-content/70">1 GNO</p>
					<p className="text-xs text-base-content/70">{network.cl.maxBalance} GNO</p>
				</div>
			</fieldset>
			<div className="mt-4">
				<p className="text-sm text-gray-500">Top up: {depositAmounts.length} validator(s)</p>
			</div>
			<div className="mt-8 flex w-full justify-end">
				<TransactionButton
					calls={calls}
					onSuccess={() => { onDepositSuccess(); closeModal(); }}
					className="btn btn-primary"
				>
					{needsApproval
						? `Approve & Deposit ${Number(formatEther(totalDepositAmount)).toFixed(2)} GNO`
						: `Deposit ${Number(formatEther(totalDepositAmount)).toFixed(2)} GNO`}
				</TransactionButton>
			</div>
		</>
	);
}
