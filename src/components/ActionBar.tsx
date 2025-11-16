import { useState } from "react";
import QuickConsolidation from "./QuickConsolidation";
import { ValidatorInfo } from "../types/validators";
import WithdrawBatch from "./WithdrawBatch";
import PartialDepositBatch from "./PartialDepositBatch";
import { useModal } from "../context/ModalContext";

interface ActionBarProps {
    selected: ValidatorInfo[];
}

export default function ActionBar({ selected }: ActionBarProps) {
    const [tab, setTab] = useState<'consolidate' | 'withdraw' | 'topup'>('consolidate');
    const { openModal } = useModal();
    
    return (
        <div className="flex flex-col sm:flex-row justify-between w-full z-10 fixed bottom-0 left-0 bg-base-100 border-t-2 border-primary/20 py-3 px-4">
            <div className="flex items-center">
                <p className="border-r border-base-content/10 pr-3">{selected.length} selected</p>
                <button className="btn btn-xs btn-ghost">Clear selection</button>
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
                <button 
                    className="btn btn-accent" 
                    onClick={() => {
                        if (tab === 'consolidate') openModal(<QuickConsolidation validators={selected} />);
                        else if (tab === 'withdraw') openModal(<WithdrawBatch validators={selected} />);
                        else openModal(<PartialDepositBatch validators={selected} />);
                    }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}