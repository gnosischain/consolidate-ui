import { useRef, useState } from "react";
import { formatEther } from "viem";
import { useWallet } from "../context/WalletContext";
import useDeposit from "../hooks/useDeposit";

export default function Deposit() {

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const { balance, network, account } = useWallet();
  if (!network || !account.address) {
    throw new Error('Network or account not found');
  }
	const { setDepositData, depositData, approve, isApproved, deposit } = useDeposit(network, account.address, false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setDepositData(file);
    }
  };

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
          <p className="text-sm text-gray-500">Balance: {Number(formatEther(balance.balance)).toFixed(2)} GNO</p>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Upload deposit data file</legend>
            <input type="file" className="file-input" onChange={handleFileChange} />
            <label className="label">{file?.name}</label>
          </fieldset>
          <div className="mt-8 flex w-full justify-end">
            <button className="btn btn-primary" disabled={depositData.totalDepositAmount === 0n} onClick={() => isApproved ? deposit() : approve(depositData.totalDepositAmount)}>
                {isApproved ? 'Deposit ' : 'Approve ' + formatEther(depositData.totalDepositAmount) + ' GNO'}
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
