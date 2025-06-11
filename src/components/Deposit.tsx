import { useMemo, useRef, useState } from "react";
import { formatEther, parseEther } from "viem";


interface DepositProps {}

export default function Deposit({}: DepositProps) {

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [amount, setAmount] = useState(0);
  const GNOBalance = 0n

  // const { withdrawals, exits, withdrawalsAmount } = useMemo(() => computeWithdrawals(validators, parseEther(amount.toString()), totalBalance, preventExit), [validators, amount, totalBalance, preventExit]);
  return (
    <>
      <button
        className="btn btn-xs btn-primary"
        onClick={() => dialogRef.current?.showModal()}
      >
        Add new
      </button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Add new validator</h3>
          <p className="text-sm text-gray-500">Balance: {formatEther(GNOBalance)} GNO</p>
          <fieldset className="fieldset mt-2 w-full gap-y-2">
            <legend className="fieldset-legend">Withdraw amount <button className="btn btn-xs" onClick={() => setAmount(Number(formatEther(GNOBalance)))}>Max</button></legend>
            <input
              type="number"
              placeholder="Type here"
              className="input input-primary input-sm w-full"
              name="amount"
              max={formatEther(GNOBalance)}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

          </fieldset>
          <div className="mt-8 flex w-full justify-end">
            <button className="btn btn-primary" disabled={amount === 0} onClick={() =>
              console.log(amount)}>
              {'Deposit ' + amount.toFixed(2) + ' GNO'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
