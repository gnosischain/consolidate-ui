import { useState } from "react";
import { ValidatorInfo } from "../types/validators";
import { formatEther, parseEther } from "viem";
import { useWithdraw } from "../hooks/useWithdraw";
import { useWallet } from "../context/WalletContext";
import { useModal } from "../context/ModalContext";
import { useTransactionToast } from "../hooks/useTransactionToast";

interface WithdrawProps {
  validator: ValidatorInfo;
}

export default function Withdraw({ validator }: WithdrawProps) {
  const { network } = useWallet();
  if (!network) {
    throw new Error('Network not found');
  }

  const { withdrawValidators, isPending, isSuccess, error } = useWithdraw(network);
  const { closeModal } = useModal();

  useTransactionToast({
    isPending,
    isSuccess,
    error,
    loadingMessage: 'Withdrawing...',
    successMessage: 'Withdrawal successful',
    onSuccess: closeModal,
  });

  const [amount, setAmount] = useState(validator.type === 1 ? validator.balance : 0n);

  const minBalance = parseEther(network.cl.minBalance.toString());
  const remaining = validator.balance - amount;
  const isLowBalance = remaining > 0n && remaining < minBalance;

  return (
    <>
      <h3 className="text-lg font-bold">Withdraw #{validator.index}</h3>
      <p className="text-sm text-gray-500">Balance: {Number(formatEther(validator.balance)).toFixed(2)} GNO</p>
      <fieldset className="fieldset mt-2 w-full gap-y-2">
        {validator.type === 2 ? <legend className="fieldset-legend">Withdraw amount <button className="btn btn-xs" onClick={() => setAmount(validator.balance)}>Max</button></legend> : <legend className="fieldset-legend">Exit validator</legend>}
        <label className="input input-primary input-sm w-full">
          <input
            type="number"
            placeholder="Type here"
            className="grow"
            name="amount"
            max={formatEther(validator.balance)}
            value={formatEther(amount)}
            onChange={(e) => setAmount(parseEther(e.target.value))}
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
        <span className="text-base-content/70">Withdrawals may take one or two days to complete depending on the network.</span>
      </div>

      <div className="mt-6 flex w-full justify-end">
        <button className="btn btn-primary" onClick={() =>
          withdrawValidators([
            {
              pubkey: validator.pubkey,
              amount: amount === validator.balance ? 0n : amount,
            },
          ])}
          disabled={amount === 0n || isPending}>
          {isPending ? 'Processing...' : (amount === validator.balance ? 'Exit validator' : 'Withdraw ' + formatEther(amount) + ' GNO')}
        </button>
      </div>
    </>
  );
}
