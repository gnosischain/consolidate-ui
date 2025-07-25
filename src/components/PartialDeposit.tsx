import { useRef, useState } from "react";
import { formatEther, formatGwei, parseEther, parseGwei } from "viem";
import { useWallet } from "../context/WalletContext";
import useDeposit from "../hooks/useDeposit";
import { ValidatorInfo } from "../types/validators";

export default function PartialDeposit({ validator }: { validator: ValidatorInfo }) {

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [file, setFile] = useState<File | null>(null);
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
  const [amount, setAmount] = useState(0n);

  return (
    <>
      <button className="btn btn-ghost btn-circle btn-sm"
        onClick={() => dialogRef.current?.showModal()}><img src="/deposit.svg" alt="Deposit" className="w-4 h-4" /></button>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Partial deposit {validator?.index}</h3>
          <p className="text-sm text-gray-500">Balance: {Number(formatEther(balance.balance)).toFixed(2)} GNO</p>
          <p className="text-xs text-gray-500">Pubkey: {validator?.pubkey}</p>
          {/* <fieldset className="fieldset">
            <legend className="fieldset-legend">Upload deposit data file</legend>
            <input type="file" className="file-input" onChange={handleFileChange} />
            <label className="label">{file?.name}</label>
          </fieldset> */}
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
            {/* <button className="btn btn-primary" disabled={depositData.totalDepositAmount === 0n} onClick={() => isApproved ? deposit() : approve(parseGwei(depositData.totalDepositAmount.toString()) / network.cl.multiplier)}>
              {isApproved ? 'Deposit ' : 'Approve ' + formatGwei(depositData.totalDepositAmount / network.cl.multiplier) + ' GNO'}
            </button> */}
            <button className="btn btn-primary" disabled={amount === 0n} onClick={() => isApproved ? partialDeposit([amount], [validator]) : approve(amount)}>
              {isApproved ? 'Deposit ' : 'Approve ' + formatEther(amount) + ' GNO'}
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
