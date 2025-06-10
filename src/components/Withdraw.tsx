import { useRef, useState } from "react";
import { ValidatorInfo, Withdrawal } from "../types/validators";


interface WithdrawProps {
  validator: ValidatorInfo;
  withdrawalValidators: (withdrawal: Withdrawal[]) => Promise<void>;
}

export default function Withdraw({ validator, withdrawalValidators }: WithdrawProps) {

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [amount, setAmount] = useState(0);

  return (
    <>
      <button
        className="btn btn-ghost btn-circle btn-sm"
        onClick={() => dialogRef.current?.showModal()}
      >
        <img src="/withdraw.svg" alt="Withdraw" className="w-4 h-4" />
      </button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Validator {validator.index}</h3>
          <p className="text-sm text-gray-500">Balance: {validator.balanceEth} GNO</p>
          <fieldset className="fieldset mt-2 w-full gap-y-2">
            <legend className="fieldset-legend">Withdraw amount <button className="btn btn-xs" onClick={() => setAmount(validator.balanceEth)}>Max</button></legend>
            <input
              type="number"
              placeholder="Type here"
              className="input input-primary input-sm w-full"
              name="amount"
              max={validator.balanceEth}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

          </fieldset>
          <div className="mt-8 flex w-full justify-end">
            <button className="btn btn-primary" onClick={() =>
              withdrawalValidators([
                {
                  pubkey: validator.pubkey,
                  amount: amount,
                },
              ])}>
              {amount === validator.balanceEth ? 'Exit validator'  : 'Withdraw ' + amount + ' GNO'}
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
