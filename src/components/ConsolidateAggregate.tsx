import { useEffect, useMemo, useState } from 'react';
import {
	computeConsolidations,
	computeSelfConsolidations,
	useConsolidateValidatorsBatch,
} from '../hooks/useConsolidate';
import { ValidatorInfo } from '../types/validators';
import { Filter } from './Filter';
import { ValidatorItem } from './ValidatorItem';
import { ConsolidationSummary } from './ConsolidationSummary';
import { formatEther, parseEther } from 'viem';
import { NetworkConfig } from '../types/network';
// import { WarningModal } from './WarningModal';

interface ConsolidateSelectProps {
	validators: ValidatorInfo[];
	network: NetworkConfig;
	goToStep: () => void;
}

export function ConsolidateAggregate({
	validators,
	network,
}: ConsolidateSelectProps) {
	const { consolidateValidators } = useConsolidateValidatorsBatch(network.consolidateAddress);
	const targetBalance = network.cl.maxBalance * 0.625;
	const [chunkSize, setChunkSize] = useState(targetBalance);
	const [filterVersion, setFilterVersion] = useState<string | undefined>(undefined);
	const [filterStatus, setFilterStatus] = useState<string | undefined>('active');
	const type1ValidatorsActive = validators.filter(
		(v) => v.type === 1 && v.filterStatus === 'active'
	);

	const filteredValidators = useMemo(() => {
		let result = validators;
		if (filterVersion) {
			result = result.filter((v) => v.type === Number(filterVersion));
		}
		if (filterStatus) {
			result = result.filter((v) => v.filterStatus === filterStatus);
		}
		return result;
	}, [validators, filterVersion, filterStatus]);

	const filteredActive = useMemo(
		() => filteredValidators.filter(v => v.filterStatus === 'active'),
		[filteredValidators]
	);

	const { consolidations, totalGroups, skippedValidators } = useMemo(() => {
		const type1Filtered = filteredActive.filter(
			(v) => v.type === 1 && v.filterStatus === 'active'
		);
		const compoundingFiltered = filteredActive.filter(
			(v) => v.type === 2 && v.filterStatus === 'active'
		);

		const { consolidations, skippedValidators, targets } = computeConsolidations(compoundingFiltered, type1Filtered, parseEther(chunkSize.toString()));
		const totalGroups = targets.size + skippedValidators.length;

		return { consolidations, totalGroups, skippedValidators };
	}, [filteredActive, chunkSize]);

	const handleUpgradeAll = async () => {
		const consolidations = computeSelfConsolidations(type1ValidatorsActive);
		await consolidateValidators(consolidations);
	};

	useEffect(() => setChunkSize(targetBalance), [targetBalance]);

	return (
		<div className="w-full flex flex-col justify-center gap-y-2 p-2">
			{/* <WarningModal totalBalance={totalBalance} network={network} /> */}

			{/* FILTER */}
			<div className="flex gap-x-2 items-center w-full mt-4">
				<p className="text-sm">Version</p>
				<Filter text="All" filter={filterVersion} setFilter={setFilterVersion} value={undefined} />
				<Filter text="1" filter={filterVersion} setFilter={setFilterVersion} value={'1'} />
				<Filter text="2" filter={filterVersion} setFilter={setFilterVersion} value={'2'} />
			</div>
			<div className="flex items-center justify-between w-full">
				<div className="flex gap-x-2 items-center w-full">
					<p className="text-sm">Status</p>
					<Filter text="All" filter={filterStatus} setFilter={setFilterStatus} value={undefined} />
					<Filter
						text="Active"
						filter={filterStatus}
						setFilter={setFilterStatus}
						value={'active'}
					/>
					<Filter
						text="Exited"
						filter={filterStatus}
						setFilter={setFilterStatus}
						value={'exited'}
					/>
					<Filter
						text="Pending"
						filter={filterStatus}
						setFilter={setFilterStatus}
						value={'pending'}
					/>
				</div>
				{filterVersion === '1' && (
					<button className="btn btn-sm btn-ghost text-primary" onClick={handleUpgradeAll}>
						Upgrade all
					</button>
				)}
			</div>
			<div className="overflow-auto h-72">
				<table className="table table-pin-rows table-zebra">
					{/* head */}
					<thead>
						<tr className="bg-base-200">
							<th>Index</th>
							<th>Type</th>
							<th>Status</th>
							<th>Balance</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{filteredValidators.map((v) => (
							<ValidatorItem
								key={v.index}
								validator={v}
							/>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex flex-col w-full items-center mt-4 gap-y-2">
				<p className="text-xs">Balance min: {chunkSize}</p>
				<input
					type="range"
					min={network.cl.minBalance}
					max={network.cl.maxBalance}
					value={chunkSize}
					className="range range-sm range-primary"
					onChange={(e) => setChunkSize(Number(e.target.value))}
				/>
			</div>

			<div className="w-full flex flex-col items-center gap-y-4">
				<div className="text-center text-sm p-2">
					<p>{totalGroups} validators after consolidation</p>
					<p>{consolidations.length} consolidations request</p>

					{skippedValidators.length > 0 && (
						<div className="mt-2">
							<p className="text-warning text-sm">
								{skippedValidators.length} validators skipped
							</p>
							<ul className="list-disc list-inside text-xs mt-1">
								{skippedValidators.map((v) => (
									<li key={v.index}>
										{v.index} ({Number(formatEther(v.balanceEth)).toFixed(2)} GNO)
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
				<ConsolidationSummary consolidations={consolidations} />
			</div>
		</div>
	);
}
