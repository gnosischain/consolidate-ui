import { formatEther, parseEther } from 'viem';
import { EL_FEE } from '../constants/misc';
import { ConsolidationSummary } from './ConsolidationSummary';
import { useEffect, useMemo, useState } from 'react';
import { computeConsolidations } from '../hooks/useConsolidate';
import { ValidatorInfo } from '../types/validators';
import { useWallet } from '../context/WalletContext';
import { useModal } from '../context/ModalContext';

interface ConsolidateProps {
	validators: ValidatorInfo[];
}

export default function Consolidate({ validators }: ConsolidateProps) {
	const { network } = useWallet();
	if (!network) {
		throw new Error('Network not found');
	}
	const targetBalance = network.cl.maxBalance * 0.625;
	const [chunkSize, setChunkSize] = useState(targetBalance);
	const { openModal } = useModal();
	const { consolidations, totalGroups, skippedValidators } = useMemo(() => {
		const type1Filtered = validators.filter((v) => v.type === 1 && v.filterStatus === 'active');
		const compoundingFiltered = validators.filter(
			(v) => v.type === 2 && v.filterStatus === 'active',
		);

		const { consolidations, skippedValidators, targets } = computeConsolidations(
			compoundingFiltered,
			type1Filtered,
			parseEther(chunkSize.toString()),
		);
		const totalGroups = targets.size + skippedValidators.length;

		return { consolidations, totalGroups, skippedValidators };
	}, [validators, chunkSize]);

	useEffect(() => setChunkSize(targetBalance), [targetBalance]);

	return (
		<>
			<div className="flex w-full flex-col">
				<p className="text-lg font-bold">Consolidate</p>
				<p className="text-base-content/70 text-xs">Balance min: {chunkSize}</p>
				<input
					type="range"
					min={network.cl.minBalance}
					max={network.cl.maxBalance}
					value={chunkSize}
					className="range range-sm range-primary mt-8 w-full"
					onChange={(e) => setChunkSize(Number(e.target.value))}
				/>
				<div className="flex w-full justify-between">
					<p className="text-base-content/70 text-xs">1 GNO</p>
					<p className="text-base-content/70 text-xs">{network.cl.maxBalance} GNO</p>
				</div>
			</div>

			<div className="bg-primary/5 mt-8 flex w-full flex-col rounded-lg p-4">
				<p className="mb-2 font-semibold">Consolidation summary</p>
				<div className="flex justify-between text-sm">
					<p className="text-base-content/70">Consolidations request:</p>
					<p>{consolidations.length}</p>
				</div>
				<div className="flex justify-between text-sm">
					<p className="text-base-content/70">Processing fees:</p>
					<p>{(EL_FEE * BigInt(consolidations.length)).toString()} wei</p>
				</div>
				<div className="border-base-content/5 mt-2 mb-6 flex justify-between border-t pt-2 text-sm">
					<p className="text-base-content/70">Validators remaining:</p>
					<p>{totalGroups}</p>
				</div>

				{skippedValidators.length > 0 && (
					<div className="mt-2 mb-4">
						<p className="text-warning text-sm">{skippedValidators.length} validators skipped</p>
						<ul className="mt-1 list-inside list-disc text-xs">
							{skippedValidators.map((v) => (
								<li key={v.index}>
									{v.index} ({Number(formatEther(v.balance)).toFixed(2)} GNO)
								</li>
							))}
						</ul>
					</div>
				)}
				<button
					className="btn btn-primary"
					onClick={() => openModal(<ConsolidationSummary consolidations={consolidations} />)}
					disabled={consolidations.length === 0}
				>
					View Details
				</button>
			</div>
		</>
	);
}
