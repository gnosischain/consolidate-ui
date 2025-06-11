import { useEffect, useMemo, useState } from 'react';
import {
	computeConsolidations,
	computeSelfConsolidations,
} from '../hooks/useConsolidate';
import { NetworkConfig } from '../constants/networks';
import { Consolidation, ValidatorInfo } from '../types/validators';
import { Filter } from './Filter';
import { ValidatorItem } from './ValidatorItem';
import { Withdrawal } from '../types/validators';
import { ConsolidationSummary } from './ConsolidationSummary';
import WithdrawBatch from './WithdrawBatch';
import { formatEther, parseEther } from 'viem';

interface ConsolidateSelectProps {
	validators: ValidatorInfo[];
	consolidateValidators: (consolidations: Consolidation[]) => Promise<void>;
	withdrawalValidators: (withdrawal: Withdrawal[]) => Promise<void>;
	network: NetworkConfig;
	goToStep: () => void;
	computeWithdrawals: (validators: ValidatorInfo[], amountToWithdraw: bigint, totalValidatorBalance: bigint, preventExit: boolean) => { withdrawals: Withdrawal[], exits: ValidatorInfo[], withdrawalsAmount: bigint };
}

export function ConsolidateAggregate({
	validators,
	consolidateValidators,
	withdrawalValidators,
	computeWithdrawals,
	network,
}: ConsolidateSelectProps) {
	const targetBalance = network.cl.maxBalance * 0.625;
	const [chunkSize, setChunkSize] = useState(targetBalance);
	const [filterVersion, setFilterVersion] = useState<string | undefined>(undefined);
	const [filterStatus, setFilterStatus] = useState<string | undefined>('active');
	const type1ValidatorsActive = validators.filter(
		(v) => v.type === 1 && v.filterStatus === 'active'
	);
	const compoundingValidatorsActive = validators.filter(
		(v) => v.type === 2 && v.filterStatus === 'active'
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

	const totalBalance = useMemo(() => {
		return validators.filter(v => v.filterStatus === 'active').reduce((acc, v) => acc + v.balanceEth, 0n);
	}, [validators]);

	const totalCompoundingBalance = useMemo(() => {
		return compoundingValidatorsActive.reduce((acc, v) => acc + v.balanceEth, 0n);
	}, [compoundingValidatorsActive]);

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
			<p className="font-bold">Your validators</p>
			<div className="flex items-center  w-full">
				<p className="text-sm text-gray-500 mr-2">Balance: {formatEther(totalBalance)} GNO</p>
				<WithdrawBatch validators={compoundingValidatorsActive} totalBalance={totalCompoundingBalance} withdrawalValidators={withdrawalValidators} computeWithdrawals={computeWithdrawals} />
			</div>

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
				<table className="table">
					{/* head */}
					<thead>
						<tr>
							{/* <th></th> */}
							<th>Index</th>
							<th>Type</th>
							<th>Status</th>
							<th>Balance</th>
						</tr>
					</thead>
					<tbody>
						{filteredValidators.map((v) => (
							<ValidatorItem
								key={v.index}
								validator={v}
								consolidateValidators={async (consolidations) => {
									await consolidateValidators(consolidations);
								}}
								withdrawalValidators={async (withdrawal) => {
									withdrawal.forEach((w) => {
										w.amount = w.amount * BigInt(network.cl.multiplier);
									});
									await withdrawalValidators(withdrawal);
								}}
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
										{v.index} ({formatEther(v.balanceEth)} GNO)
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
				<ConsolidationSummary consolidations={consolidations} consolidateValidators={consolidateValidators} />
			</div>
		</div>
	);
}
