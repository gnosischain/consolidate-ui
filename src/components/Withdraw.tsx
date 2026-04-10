import { useMemo, useState } from 'react';
import { ValidatorInfo } from '../types/validators';
import { formatEther, parseEther } from 'viem';
import { useWithdraw } from '../hooks/useWithdraw';
import { useWallet } from '../context/WalletContext';
import { useModal } from '../context/ModalContext';

interface WithdrawProps {
	validator: ValidatorInfo;
}

export default function Withdraw({ validator }: WithdrawProps) {
	const { network } = useWallet();
	if (!network) {
		throw new Error('Network not found');
	}
	const { closeModal } = useModal();
	const { withdrawValidators, isPending } = useWithdraw(network, { onSuccess: closeModal });

	const [amountStr, setAmountStr] = useState(
		validator.type === 1 ? formatEther(validator.balance) : '0',
	);

	const parsedAmount = useMemo(() => {
		try {
			return parseEther(amountStr);
		} catch {
			return null;
		}
	}, [amountStr]);

	const minBalance = parseEther(network.cl.minBalance.toString());
	const isValid = parsedAmount !== null && parsedAmount > 0n && parsedAmount <= validator.balance;
	const remaining = parsedAmount !== null ? validator.balance - parsedAmount : validator.balance;
	const isLowBalance = isValid && remaining > 0n && remaining < minBalance;

	const handleSubmit = () => {
		if (!isValid || parsedAmount === null) return;
		withdrawValidators([
			{
				pubkey: validator.pubkey,
				amount: parsedAmount === validator.balance ? 0n : parsedAmount,
			},
		]);
	};

	return (
		<>
			<h3 className="text-lg font-bold">Withdraw #{validator.index}</h3>
			<p className="text-sm text-gray-500">
				Balance: {Number(formatEther(validator.balance)).toFixed(2)} GNO
			</p>
			<fieldset className="fieldset mt-2 w-full gap-y-2">
				{validator.type === 2 ? (
					<legend className="fieldset-legend">
						Withdraw amount{' '}
						<button className="btn btn-xs" onClick={() => setAmountStr(formatEther(validator.balance))}>
							Max
						</button>
					</legend>
				) : (
					<legend className="fieldset-legend">Exit validator</legend>
				)}
				<label className="input input-primary input-sm w-full">
					<input
						type="number"
						placeholder="Type here"
						className="grow"
						name="amount"
						max={formatEther(validator.balance)}
						value={amountStr}
						onChange={(e) => setAmountStr(e.target.value)}
						disabled={validator.type === 1}
					/>
					<span className="text-xs text-base-content/70 font-medium">GNO</span>
				</label>
			</fieldset>

			{isLowBalance && (
				<div role="alert" className="alert alert-warning p-2 text-xs mt-1 flex items-center gap-2">
					<span>Warning: Remaining balance will be below {network.cl.minBalance} GNO (Low).</span>
				</div>
			)}

			<div className="mt-4 text-xs text-base-content/70 space-y-1 bg-primary/5 p-3 rounded-lg">
				<div className="flex justify-between">
					<span>Network Fee:</span>
					<span className="font-medium">~0.0001 GNO</span>
				</div>
				<span className="text-base-content/70">
					Withdrawals may take one or two days to complete depending on the network.
				</span>
			</div>

			<div className="mt-6 flex w-full justify-end">
				<button
					className="btn btn-primary"
					onClick={handleSubmit}
					disabled={!isValid || isPending}
				>
					{isPending
						? 'Processing...'
						: parsedAmount === validator.balance
							? 'Exit validator'
							: `Withdraw ${isValid && parsedAmount ? formatEther(parsedAmount) : ''} GNO`}
				</button>
			</div>
		</>
	);
}
