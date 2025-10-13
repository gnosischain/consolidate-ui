import { useState } from "react";

interface ActionBarProps {
    selected: Set<number>;
}

export default function ActionBar({ selected }: ActionBarProps) {
    const [tab, setTab] = useState<'consolidate' | 'withdraw' | 'topup'>('consolidate');
    return (
        <div className="flex justify-between w-full z-10 fixed bottom-0 left-0 bg-base-100 border-t-2 border-primary/20 py-3 px-4">
            <div className="flex items-center">
                <p className="border-r border-base-content/10 pr-3">{selected.size} {selected.size === 1 ? 'validator' : 'validators'} selected</p>
                <button className="btn btn-xs btn-ghost">Clear selection</button>
            </div>
            <div className="flex items-center gap-x-2">
                <div role="tablist" className="tabs tabs-md tabs-box">
                    <input type="radio" name="tab" className="tab" aria-label="Consolidate" checked={tab === 'consolidate'} onChange={() => setTab('consolidate')} />
                    <input type="radio" name="tab" className="tab" aria-label="Withdraw" checked={tab === 'withdraw'} onChange={() => setTab('withdraw')} />
                    <input type="radio" name="tab" className="tab" aria-label="Top up" checked={tab === 'topup'} onChange={() => setTab('topup')} />
                </div>
                <button className="btn btn-md btn-primary">Continue</button>
            </div>
        </div>
    );
}