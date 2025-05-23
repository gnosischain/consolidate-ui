import { useEffect, useMemo, useState } from 'react';
import {
	computeConsolidations,
	// computeSelfConsolidations,
	Consolidation,
	simulateConsolidation,
} from '../hooks/useConsolidate';
import { NETWORK_CONFIG } from '../constants/networks';
// import { ValidatorList } from './ValidatorList';
import { ValidatorInfo } from '../types/validators';
import { Filter } from './Filter';
import { ValidatorList2 } from './ValidatorList2';

interface ConsolidateSelectProps {
	validators: ValidatorInfo[];
	consolidateValidators: (consolidations: Consolidation[]) => Promise<void>;
	chainId: number;
	goToStep: () => void;
}

export function ConsolidateAggregate({
	validators,
	consolidateValidators,
	chainId,
}: ConsolidateSelectProps) {
	const network = NETWORK_CONFIG[chainId];
	const targetBalance = network.cl.maxBalance * 0.625;
	const [chunkSize, setChunkSize] = useState(targetBalance);
	const [filterVersion, setFilterVersion] = useState<string | undefined>(undefined);
	const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
	const [includeType1, setIncludeType1] = useState(true);
	const type1Validators = validators.filter((v) => v.type === 1);
	const compoundingValidators = validators.filter((v) => v.type === 2);
	const simulation = simulateConsolidation(
		compoundingValidators,
		type1Validators,
		chunkSize,
		includeType1,
	);

	const filteredValidators = useMemo(() => {
		let result = validators;
		if (filterVersion) {
			result = result.filter((v) => v.type === Number(filterVersion));
		}
		if (filterStatus) {
			result = result.filter((v) => v.status === filterStatus);
		}
		return result;
	}, [validators, filterVersion, filterStatus]);

	const handleConsolidate = async () => {
		const t1Pool = includeType1 ? type1Validators : [];

		const { consolidations } = computeConsolidations(compoundingValidators, t1Pool, chunkSize);

		await consolidateValidators(consolidations);
	};

	// const handleUpgradeAll = async () => {
	// 	const consolidations = computeSelfConsolidations(type1Validators);
	// 	await consolidateValidators(consolidations);
	// };

	useEffect(() => setChunkSize(targetBalance), [targetBalance]);

	return (
		<div className="w-full flex w-full flex-col justify-center gap-y-2 p-2">
			<p className="font-bold">Your validators</p>

			{/* FILTER */}
			<div className="flex gap-x-2 items-center w-full">
				<p className="text-sm">Version</p>
				<Filter text="All" filter={filterVersion} setFilter={setFilterVersion} value={undefined} />
				<Filter text="1" filter={filterVersion} setFilter={setFilterVersion} value={'1'} />
				<Filter text="2" filter={filterVersion} setFilter={setFilterVersion} value={'2'} />
			</div>
			<div className="flex gap-x-2 items-center w-full">
				<p className="text-sm">Status</p>
				<Filter text="All" filter={filterStatus} setFilter={setFilterStatus} value={undefined} />
				<Filter text="Active" filter={filterStatus} setFilter={setFilterStatus} value={'active'} />
				<Filter text="Inactive" filter={filterStatus} setFilter={setFilterStatus} value={'inactive'} />
				<Filter text="Pending" filter={filterStatus} setFilter={setFilterStatus} value={'pending'} />
			</div>
			<ValidatorList2 validators={filteredValidators}/>
			{/* <ValidatorList
				title={`Compounding Validators (${compoundingValidators.length})`}
				validators={compoundingValidators}
			/>
			<div className="flex justify-end mt-4">
				<button className="btn btn-sm btn-ghost text-primary" onClick={handleUpgradeAll}>
					Upgrade all
				</button>
			</div>

			<ValidatorList
				title={`0x01 Validators (${type1Validators.length})`}
				validators={type1Validators}
				actionLabel="Upgrade"
				onAction={(v) => consolidateValidators(computeSelfConsolidations([v]))}
			/> */}

			<div className="flex flex-col w-full items-center mt-4 gap-y-2">
				<p className="text-xs">Balance min: {chunkSize}</p>
				<input
					type="range"
					min={network.cl.minBalance}
					max={network.cl.maxBalance}
					value={chunkSize}
					className="range range-sm range-primary"
					onChange={(e) => setChunkSize(Number(e.target.value))}
				></input>

				{type1Validators.length > 0 && (
					<label className="label">
						<input
							className="checkbox checkbox-sm"
							type="checkbox"
							checked={includeType1}
							onChange={(e) => setIncludeType1(e.currentTarget.checked)}
						/>
						Include 0x01 validators
					</label>
				)}
			</div>

			<div className="w-full flex flex-col items-center gap-y-4">
				<div className="text-center text-sm p-2">
					<p>{simulation.totalGroups} validators after consolidation</p>
					<p>{simulation.consolidations.length} consolidations request</p>

					{simulation.skippedValidators.length > 0 && (
						<div className="mt-2">
							<p className="text-warning text-sm">
								{simulation.skippedValidators.length} validators skipped
							</p>
							<ul className="list-disc list-inside text-xs mt-1">
								{simulation.skippedValidators.map((v) => (
									<li key={v.index}>
										{v.index} ({v.balanceEth} GNO)
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
				<div className="flex flex-col gap-y-2 w-full">
					<div className="collapse collapse-arrow border-base-300 border">
						<input type="checkbox" />
						<div className="collapse-title text-sm font-semibold">Details</div>
						<div className="collapse-content text-sm">
							<ul className="list rounded-box max-h-60 overflow-y-auto">
								{simulation.consolidations.map((c, i) => (
									<li key={i} className="list-row flex justify-between items-center rounded-lg">
										<p className="text-sm">
											{c.sourceIndex} → {c.targetIndex} ({c.sourceBalance + c.targetBalance} GNO)
										</p>
										{c.sourceIndex === c.targetIndex && (
											<p className="text-warning text-xs">Self consolidation</p>
										)}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
				<button onClick={handleConsolidate} className="btn btn-primary">
					Consolidate
				</button>
			</div>
		</div>
	);
}
