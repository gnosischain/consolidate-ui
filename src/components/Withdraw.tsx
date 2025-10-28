import { useState } from "react";
import { ValidatorInfo } from "../types/validators";
import { formatEther, parseEther } from "viem";
import { useWithdraw } from "../hooks/useWithdraw";
import { useWallet } from "../context/WalletContext";

interface WithdrawProps {
  validator: ValidatorInfo;
}

export default function Withdraw({ validator }: WithdrawProps) {
  const { network } = useWallet();
  if (!network) {
    throw new Error('Network not found');
  }

  const { withdrawalValidators } = useWithdraw(network);
  const [amount, setAmount] = useState(validator.type === 1 ? validator.balanceEth : 0n);

  return (
    <>
      <h3 className="text-lg font-bold">Validator {validator.index}</h3>
      <p className="text-sm text-gray-500">Balance: {Number(formatEther(validator.balanceEth)).toFixed(2)} GNO</p>
      <fieldset className="fieldset mt-2 w-full gap-y-2">
        {validator.type === 2 ? <legend className="fieldset-legend">Withdraw amount <button className="btn btn-xs" onClick={() => setAmount(validator.balanceEth)}>Max</button></legend> : <legend className="fieldset-legend">Exit validator</legend>}
        <input
          type="number"
          placeholder="Type here"
          className="input input-primary input-sm w-full"
          name="amount"
          max={formatEther(validator.balanceEth)}
          value={formatEther(amount)}
          onChange={(e) => setAmount(parseEther(e.target.value))}
          disabled={validator.type === 1}
        />

      </fieldset>
      <div className="mt-8 flex w-full justify-end">
        <button className="btn btn-primary" onClick={() =>
          withdrawalValidators([
            {
              pubkey: validator.pubkey,
              amount: amount === validator.balanceEth ? 0n : amount,
            },
          ])}
          disabled={amount === 0n}>
          {amount === validator.balanceEth ? 'Exit validator' : 'Withdraw ' + formatEther(amount) + ' GNO'}
        </button>
      </div>
    </>
  );
}
