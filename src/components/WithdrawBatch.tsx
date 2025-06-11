import { useMemo, useRef, useState } from "react";
import { ValidatorInfo } from "../types/validators";
import { Withdrawal } from "../types/validators";
import { formatEther, parseEther } from "viem";


interface WithdrawProps {
  validators: ValidatorInfo[];
  totalBalance: bigint;
  withdrawalValidators: (withdrawal: Withdrawal[]) => Promise<void>;
  computeWithdrawals: (validators: ValidatorInfo[], amountToWithdraw: bigint, totalValidatorBalance: bigint, preventExit: boolean) => { withdrawals: Withdrawal[], exits: ValidatorInfo[], withdrawalsAmount: bigint };
}

export default function WithdrawBatch({ validators, totalBalance, withdrawalValidators, computeWithdrawals }: WithdrawProps) {

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [amount, setAmount] = useState(0);
  const [preventExit, setPreventExit] = useState(true);

  const { withdrawals, exits, withdrawalsAmount } = useMemo(() => computeWithdrawals(validators, parseEther(amount.toString()), totalBalance, preventExit), [validators, amount, totalBalance, preventExit]);
  return (
    <>
      <button
        className="btn btn-xs btn-outline btn-primary"
        onClick={() => dialogRef.current?.showModal()}
      >
        Withdraw
        <img src="/withdraw-batch.svg" alt="Withdraw" className="w-4 h-4" />
      </button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Batch withdraw</h3>
          <p className="text-sm text-gray-500">Balance: {formatEther(totalBalance)} GNO</p>
          <fieldset className="fieldset mt-2 w-full gap-y-2">
            <legend className="fieldset-legend">Withdraw amount <button className="btn btn-xs" onClick={() => setAmount(Number(formatEther(totalBalance)))}>Max</button></legend>
            <div className="flex items-center gap-x-2">
              <input type="checkbox" className="checkbox checkbox-xs" checked={preventExit} onChange={() => setPreventExit(!preventExit)} />
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
            <p className={`text-sm ${exits.length === 0 ? 'text-gray-500' : 'text-warning'}`}>Exits: {exits.length}</p>
            <ul className="flex text-xs gap-x-2">
              {exits.map((exit) => (
                <li key={exit.index}>{exit.index}</li>
              ))}
            </ul>

          </div>
          <div className="mt-8 flex w-full justify-end">
            <button className="btn btn-primary" disabled={withdrawals.length === 0} onClick={() =>
              withdrawalValidators(withdrawals)}>
              {'Withdraw ' + Number(formatEther(withdrawalsAmount)).toFixed(2) + ' GNO'}
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
