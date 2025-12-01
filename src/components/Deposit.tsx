import { useState } from "react";
import { formatEther } from "viem";
import { useWallet } from "../context/WalletContext";
import useDeposit from "../hooks/useDeposit";
import { useModal } from "../context/ModalContext";
import { useTransactionToast } from "../hooks/useTransactionToast";

export default function Deposit() {

  const [file, setFile] = useState<File | null>(null);
  const { balance, network, account } = useWallet();
  if (!network || !account.address) {
    throw new Error('Network or account not found');
  }
  const { setDepositData, depositData, approve, isApproved, deposit, depositSuccess, approveSuccess, error, approveLoading, depositLoading } = useDeposit(network, account.address);
  const { closeModal } = useModal();

  useTransactionToast({
    isLoading: approveLoading,
    isSuccess: approveSuccess,
    error: null,
    loadingMessage: 'Approving...',
    successMessage: 'Approval successful',
  });

  useTransactionToast({
    isLoading: depositLoading,
    isSuccess: depositSuccess,
    error,
    loadingMessage: 'Depositing...',
    successMessage: 'Deposit successful',
    onSuccess: closeModal,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      setDepositData(file);
    }
  };

  return (
    <>
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
    </>
  );
}
