import { useMemo, useState } from 'react';
import { formatEther, parseEther } from 'viem';
import { useWallet } from '../context/WalletContext';
import useDeposit from '../hooks/useDeposit';
import { ValidatorInfo } from '../types/validators';
import { useModal } from '../context/ModalContext';
import { TransactionButton } from './TransactionButton';

export default function PartialDeposit({ validator }: { validator: ValidatorInfo }) {
	const { balance, network, account } = useWallet();
	if (!network || !account.address) {
		throw new Error('Network or account not found');
	}
	const { closeModal } = useModal();
	const { buildPartialDepositCalls, onDepositSuccess, allowance } = useDeposit(
		network,
		account.address,
	);
	const [amount, setAmount] = useState(0n);

	const calls = useMemo(
		() => buildPartialDepositCalls([amount], [validator]),
		[amount, validator, buildPartialDepositCalls],
	);

	const needsApproval = allowance < amount;

	return (
		<>
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold">Partial deposit {validator?.index}</h3>
			</div>
			<p className="text-sm text-gray-500">
				Balance: {Number(formatEther(balance.balance)).toFixed(2)} GNO
			</p>

			<fieldset className="fieldset mt-2 w-full gap-y-2">
				<legend className="fieldset-legend">
					Amount to deposit{' '}
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

			<div className="mt-8 flex w-full justify-end">
				<TransactionButton
					calls={calls}
					disabled={amount === 0n}
					onSuccess={() => { onDepositSuccess(); closeModal(); }}
					className="btn btn-primary"
				>
					{needsApproval
						? `Approve & Deposit ${formatEther(amount)} GNO`
						: `Deposit ${formatEther(amount)} GNO`}
				</TransactionButton>
			</div>
		</>
	);
}
