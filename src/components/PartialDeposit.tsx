import { useRef, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useWallet } from "../context/WalletContext";
import useDeposit from "../hooks/useDeposit";
import { ValidatorInfo } from "../types/validators";
import { ArrowDownToLine } from "lucide-react";

export default function PartialDeposit({ validator }: { validator: ValidatorInfo }) {

  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [view, setView] = useState<'click' | 'upload'>('click');
  const { balance, network, account } = useWallet();
  if (!network || !account.address) {
    throw new Error('Network or account not found');
  }
  const { setDepositData, depositData, approve, isApproved, deposit, partialDeposit } = useDeposit(network, account.address, true, validator?.pubkey);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setDepositData(file);
    }
  };

  // Clear file when switching to click view
  const handleViewChange = (newView: 'click' | 'upload') => {
    if (newView === 'click' && file) {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setView(newView);
  };
  const [amount, setAmount] = useState(0n);

  return (
    <>
      <button className="btn btn-ghost btn-circle btn-sm"
        onClick={() => dialogRef.current?.showModal()}><ArrowDownToLine className="w-4 h-4" /></button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Partial deposit {validator?.index}</h3>
            <button className="btn btn-ghost btn-circle btn-sm" onClick={() => handleViewChange(view === 'click' ? 'upload' : 'click')}>
              <img src={view === 'click' ? "/view.svg" : "/upload.svg"} alt="View" className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Balance: {Number(formatEther(balance.balance)).toFixed(2)} GNO</p>
          {/* <p className="text-[10px] text-gray-500">Pubkey: {validator?.pubkey}</p> */}

          <fieldset className="fieldset mt-2 w-full gap-y-2">
            {view === 'click' ? (
              <>
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
              </>
            ) : (
              <>
                <legend className="fieldset-legend">Upload deposit data file</legend>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-input"
                  value=""
                  onChange={handleFileChange}
                />
                <label className="label">{file?.name}</label>
              </>
            )}
          </fieldset>

          <div className="mt-8 flex w-full justify-end">
            {(() => {
              const depositAmount = view === 'click'
                ? amount
                : depositData.totalDepositAmount;
              const isDisabled = depositAmount === 0n;
              const handleClick = () => {
                if (isApproved) {
                  return view === 'click'
                    ? partialDeposit([amount], [validator])
                    : deposit();
                } else {
                  return approve(depositAmount);
                }
              };
              const buttonText = isApproved
                ? `Deposit ${formatEther(depositAmount)} GNO`
                : `Approve ${formatEther(depositAmount)} GNO`;

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
