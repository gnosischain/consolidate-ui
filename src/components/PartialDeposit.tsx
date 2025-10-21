import { useRef, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useWallet } from "../context/WalletContext";
import useDeposit from "../hooks/useDeposit";
import { ValidatorInfo } from "../types/validators";
import { ArrowDownToLine } from "lucide-react";

export default function PartialDeposit({ validator }: { validator: ValidatorInfo }) {

  const dialogRef = useRef<HTMLDialogElement>(null);
  const { balance, network, account } = useWallet();
  if (!network || !account.address) {
    throw new Error('Network or account not found');
  }
  const { approve, isApproved, partialDeposit } = useDeposit(network, account.address);
  const [amount, setAmount] = useState(0n);

  return (
    <>
      <button className="btn btn-ghost btn-circle btn-sm"
        onClick={() => dialogRef.current?.showModal()}><ArrowDownToLine className="w-4 h-4" /></button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Partial deposit {validator?.index}</h3>
          </div>
          <p className="text-sm text-gray-500">Balance: {Number(formatEther(balance.balance)).toFixed(2)} GNO</p>
          {/* <p className="text-[10px] text-gray-500">Pubkey: {validator?.pubkey}</p> */}

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
            {(() => {
              const isDisabled = amount === 0n;
              const handleClick = () => {
                if (isApproved) {
                  partialDeposit([amount], [validator])
                } else {
                  return approve(amount);
                }
              };
              const buttonText = isApproved
                ? `Deposit ${formatEther(amount)} GNO`
                : `Approve ${formatEther(amount)} GNO`;

              return (
                <button
                  className="btn btn-primary"
                  disabled={isDisabled}
                  onClick={handleClick}
                >
                  {buttonText}
                </button>
              );
            })()}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
