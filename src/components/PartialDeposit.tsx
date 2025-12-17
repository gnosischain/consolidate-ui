import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useWallet } from "../context/WalletContext";
import useDeposit from "../hooks/useDeposit";
import { ValidatorInfo } from "../types/validators";
import { useTransactionToast } from "../hooks/useTransactionToast";
import { useModal } from "../context/ModalContext";

export default function PartialDeposit({ validator }: { validator: ValidatorInfo }) {
  const { balance, network, account } = useWallet();
  if (!network || !account.address) {
    throw new Error('Network or account not found');
  }
  const { partialDeposit, isPending, isSuccess, error, allowance } = useDeposit(network, account.address);
  const [amount, setAmount] = useState(0n);
  const { closeModal } = useModal();

  useTransactionToast({
    isPending,
    isSuccess,
    error,
    loadingMessage: 'Processing deposit...',
    successMessage: 'Deposit successful',
    onSuccess: closeModal,
  });

  const needsApproval = allowance < amount;

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Partial deposit {validator?.index}</h3>
      </div>
      <p className="text-sm text-gray-500">Balance: {Number(formatEther(balance.balance)).toFixed(2)} GNO</p>

      <fieldset className="fieldset mt-2 w-full gap-y-2">
        <legend className="fieldset-legend">Amount to deposit <button className="btn btn-xs" onClick={() => setAmount(balance.balance)}>Max</button></legend>
        <input
          type="number"
          placeholder="Type here"
          className="input input-primary input-sm w-full"
          name="amount"
          max={formatEther(balance.balance)}
          value={formatEther(amount)}
          onChange={(e) => setAmount(parseEther(e.target.value))}
        />
      </fieldset>

      <div className="mt-8 flex w-full justify-end">
        <button
          className="btn btn-primary"
          disabled={amount === 0n || isPending}
          onClick={() => partialDeposit([amount], [validator])}
        >
          {isPending
            ? 'Processing...'
            : needsApproval
              ? `Approve & Deposit ${formatEther(amount)} GNO`
              : `Deposit ${formatEther(amount)} GNO`}
        </button>
      </div>
    </>
  );
}
