import { useRef, useState } from "react";
import ModalButton from "./ModalButton";
import QuickConsolidation from "./QuickConsolidation";
import { ValidatorInfo } from "../types/validators";
import WithdrawBatch from "./WithdrawBatch";
import PartialDepositBatch from "./PartialDepositBatch";

interface ActionBarProps {
    selected: ValidatorInfo[];
}

export default function ActionBar({ selected }: ActionBarProps) {
    const [tab, setTab] = useState<'consolidate' | 'withdraw' | 'topup'>('consolidate');
    const dialogRef = useRef<HTMLDialogElement>(null);
    
    return (
        <div className="flex flex-col sm:flex-row justify-between w-full z-10 fixed bottom-0 left-0 bg-base-100 border-t-2 border-primary/20 py-3 px-4">
            <div className="flex items-center">
                <p className="border-r border-base-content/10 pr-3">{selected.length} {selected.length === 1 ? 'validator' : 'validators'} selected</p>
                <button className="btn btn-xs btn-ghost"
                    onClick={() => dialogRef.current?.showModal()}>Clear selection</button>
            </div>
            <div className="flex items-center gap-x-4 mt-4 sm:mt-0">
                <div role="tablist" className="hidden sm:inline tabs tabs-md tabs-box">
                    <input type="radio" name="tab" className={`tab ${tab === 'consolidate' ? 'border border-primary' : ''}`} aria-label="Consolidate" checked={tab === 'consolidate'} onChange={() => setTab('consolidate')} />
                    <input type="radio" name="tab" className="tab" aria-label="Withdraw" checked={tab === 'withdraw'} onChange={() => setTab('withdraw')} />
                    <input type="radio" name="tab" className="tab" aria-label="Top up" checked={tab === 'topup'} onChange={() => setTab('topup')} />
                </div>
                <select defaultValue="consolidate" className="select select-sm sm:hidden" onChange={(e) => setTab(e.target.value as 'consolidate' | 'withdraw' | 'topup')}>
						<option value="consolidate">Consolidate</option>
						<option value="withdraw">Withdraw</option>
						<option value="topup">Top up</option>
					</select>
                <ModalButton title="Continue">
                    {tab === 'consolidate' && <QuickConsolidation validators={selected} />}
                    {tab === 'withdraw' && <WithdrawBatch validators={selected} />}
                    {tab === 'topup' && <PartialDepositBatch validators={selected} />}
                </ModalButton>
            </div>
        </div>
    );
}