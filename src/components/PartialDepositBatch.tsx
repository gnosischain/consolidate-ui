import { useMemo, useState } from "react";
import { ValidatorInfo } from "../types/validators";
import { formatEther, parseEther } from "viem";
import { useWallet } from "../context/WalletContext";
import useDeposit from "../hooks/useDeposit";

interface PartialDepositProps {
  validators: ValidatorInfo[];
}

export default function PartialDeposit({ validators }: PartialDepositProps) {
  const { network, balance, account } = useWallet();
  const [targetAmount, setTargetAmount] = useState(0);
  if (!network || !account.address) {
    throw new Error('Network not found');
  }

  const { computePartialDepositAmounts, partialDeposit } = useDeposit(network, account.address);
  const [amount, setAmount] = useState(0);

  const depositAmounts = useMemo(() => computePartialDepositAmounts(parseEther(amount.toString()), validators, BigInt(targetAmount)), [validators, amount, computePartialDepositAmounts, balance.balance, targetAmount]);

  const totalDepositAmount = useMemo(() => depositAmounts.reduce((acc, amt) => acc + amt, 0n), [depositAmounts]);

  return (
    <>
      <h3 className="text-lg font-bold">Batch top up</h3>
      <p className="text-sm text-gray-500">Balance: {Number(formatEther(balance.balance)).toFixed(2)} GNO</p>
      <fieldset className="fieldset mt-2 w-full gap-y-2">
        <legend className="fieldset-legend">Deposit amount <button className="btn btn-xs" onClick={() => setAmount(Number(formatEther(balance.balance)))}>Max</button></legend>
        <input
          type="number"
          placeholder="Type here"
          className="input input-primary input-sm w-full"
          name="amount"
          max={formatEther(balance.balance)}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

      </fieldset>
      <fieldset className="fieldset mt-2 w-full gap-y-2">
        <legend className="fieldset-legend">Target amount per validator</legend>
        <input
          type="range"
          min={network.cl.minBalance}
          max={network.cl.maxBalance}
          value={targetAmount}
          className="range range-sm range-primary mt-8 w-full"
          onChange={(e) => setTargetAmount(Number(e.target.value))}
        />
        <div className="flex justify-between w-full">
          <p className="text-xs text-base-content/70">1 GNO</p>
          <p className="text-xs text-base-content/70">{network.cl.maxBalance} GNO</p>
        </div>
      </fieldset>
      <div className="mt-4">
        <p className="text-sm text-gray-500">Top up: {depositAmounts.length} validator(s)</p>
      </div>
      <div className="mt-8 flex w-full justify-end">
        <button className="btn btn-primary" disabled={totalDepositAmount === 0n} onClick={() =>
          partialDeposit(depositAmounts, validators)}>
          {'Deposit ' + Number(formatEther(totalDepositAmount)).toFixed(2) + ' GNO'}
        </button>
      </div>
    </>
  );
}
