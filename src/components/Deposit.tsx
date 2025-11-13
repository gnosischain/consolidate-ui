import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { useWallet } from "../context/WalletContext";
import useDeposit from "../hooks/useDeposit";
import { toast } from "react-hot-toast";

export default function Deposit() {

  const [file, setFile] = useState<File | null>(null);
  const { balance, network, account } = useWallet();
  if (!network || !account.address) {
    throw new Error('Network or account not found');
  }
  const { setDepositData, depositData, approve, isApproved, deposit, depositSuccess, approveSuccess, error, approveLoading, depositLoading } = useDeposit(network, account.address);

  // Handle success toasts
  useEffect(() => {
    if (approveSuccess) {
      toast.success('Approval successful');
    }
  }, [approveSuccess]);

  useEffect(() => {
    if (depositSuccess) {
      toast.success('Deposit successful');
    }
  }, [depositSuccess]);

  // Handle loading toasts
  useEffect(() => {
    if (approveLoading) {
      toast.loading('Approving...');
    }
  }, [approveLoading]);

  useEffect(() => {
    if (depositLoading) {
      toast.loading('Depositing...');
    }
  }, [depositLoading]);

  // Handle error toast
  useEffect(() => {
    if (error) {
      toast.error(error.message.substring(0, 20));
    }
  }, [error]);

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
