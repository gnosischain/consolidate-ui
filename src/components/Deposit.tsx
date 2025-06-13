import { useRef, useState } from "react";
import { formatEther } from "viem";
import { CredentialType } from "../types/validators";


interface DepositProps {
  balance: {
    balance: bigint;
    claimBalance: bigint;
    refetchBalance: () => void;
    refetchClaimBalance: () => void;
    claim: () => void;
  };
  setDepositData: (file: File) => Promise<CredentialType | undefined>;
}
export default function Deposit({ balance, setDepositData }: DepositProps) {

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setDepositData(file);
    }
  };
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
          <p className="text-sm text-gray-500">Balance: {Number(formatEther(balance.balance)).toFixed(2)} GNO</p>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Upload deposit data file</legend>
            <input type="file" className="file-input" onChange={handleFileChange} />
            <label className="label">{file?.name}</label>
          </fieldset>
          <div className="mt-8 flex w-full justify-end">
            <button className="btn btn-primary" disabled={0 === 0} onClick={() => { }}>
              {'Deposit ' + 0 + ' GNO'}
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
