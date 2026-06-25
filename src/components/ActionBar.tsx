import { useState } from 'react';
import Consolidate from './Consolidate';
import { ValidatorInfo } from '../types/validators';
// import WithdrawBatch from "./WithdrawBatch";
// import PartialDepositBatch from "./PartialDepositBatch";
import { useModal } from '../context/ModalContext';

interface ActionBarProps {
	selected: ValidatorInfo[];
}

export default function ActionBar({ selected }: ActionBarProps) {
	const [tab, setTab] = useState<'consolidate' | 'withdraw' | 'topup'>('consolidate');
	const { openModal } = useModal();

	return (
		<div className="bg-base-100 border-primary/20 fixed bottom-0 left-0 z-10 flex w-full flex-col justify-between border-t-2 px-4 py-3 sm:flex-row">
			<div className="flex items-center">
				<p className="border-base-content/10 border-r pr-3">{selected.length} selected</p>
				<button className="btn btn-xs btn-ghost">Clear selection</button>
			</div>
			<div className="mt-4 flex items-center gap-x-4 sm:mt-0">
				<div role="tablist" className="tabs tabs-md tabs-box hidden sm:inline">
					<input
						type="radio"
						name="tab"
						className="tab"
						aria-label="Consolidate"
						checked={tab === 'consolidate'}
						onChange={() => setTab('consolidate')}
					/>
					{/* <input type="radio" name="tab" className="tab" aria-label="Withdraw" checked={tab === 'withdraw'} onChange={() => setTab('withdraw')} /> */}
					{/* <input type="radio" name="tab" className="tab" aria-label="Top up" checked={tab === 'topup'} onChange={() => setTab('topup')} /> */}
				</div>
				<select
					defaultValue="consolidate"
					className="select select-sm sm:hidden"
					onChange={(e) => setTab(e.target.value as 'consolidate' | 'withdraw' | 'topup')}
				>
					<option value="consolidate">Consolidate</option>
					{/* <option value="withdraw">Withdraw</option> */}
					<option value="topup">Top up</option>
				</select>
				<button
					className="btn btn-soft btn-primary"
					onClick={() => {
						if (tab === 'consolidate') openModal(<Consolidate validators={selected} />);
						// else if (tab === 'withdraw') openModal(<WithdrawBatch validators={selected} />);
						// else openModal(<PartialDepositBatch validators={selected} />);
					}}
				>
					Continue
				</button>
			</div>
		</div>
	);
}
