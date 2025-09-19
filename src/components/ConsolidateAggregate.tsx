import { useEffect, useMemo, useState } from 'react';
import {
	computeConsolidations,
	computeSelfConsolidations,
	useConsolidateValidatorsBatch,
} from '../hooks/useConsolidate';
import { ValidatorInfo } from '../types/validators';
import { ValidatorItem } from './ValidatorItem';
import { ConsolidationSummary } from './ConsolidationSummary';
import { formatEther, parseEther } from 'viem';
import { NetworkConfig } from '../types/network';
import { Search, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';

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
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;
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

	const totalPages = Math.ceil(filteredValidators.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedValidators = filteredValidators.slice(startIndex, endIndex);

	const getVisiblePages = () => {
		if (totalPages <= 3) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		if (currentPage <= 2) {
			return [1, 2, 3];
		}

		if (currentPage >= totalPages - 1) {
			return [totalPages - 2, totalPages - 1, totalPages];
		}

		return [currentPage - 1, currentPage, currentPage + 1];
	};

	const emptyRows = Array.from({ length: itemsPerPage - paginatedValidators.length }, (_, i) => i);

	useEffect(() => {
		setCurrentPage(1);
	}, [filterVersion, filterStatus]);

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
			{/* FILTER */}
			<div className="flex items-center justify-between w-full">
				<div className="flex items-center gap-x-2">
					<select defaultValue="" className="select select-sm w-24" onChange={(e) => setFilterVersion(e.target.value || undefined)}>
						<option value="">All versions</option>
						<option value="1">1</option>
						<option value="2">2</option>
					</select>
					<select defaultValue="" className="select select-sm w-24" onChange={(e) => setFilterStatus(e.target.value || undefined)}>
						<option value="">All status</option>
						<option value="active">Active</option>
						<option value="exited">Exited</option>
						<option value="pending">Pending</option>
					</select>
					{filterVersion === '1' && (
						<button className="btn btn-sm btn-ghost text-primary" onClick={handleUpgradeAll}>
							Upgrade all
						</button>
					)}
				</div>
				{/* TODO: Add search */}
				<label className="input input-sm w-64">
					<Search className="w-4 h-4 opacity-50" />
					<input type="search" required placeholder="Search validators..." />
				</label>
			</div>
			<div className="overflow-auto rounded-box border border-base-content/5 bg-base-100 shadow-xs mt-4">
				<table className="table table-pin-rows">
					{/* head */}
					<thead>
						<tr className="bg-base-200">
							{/* TODO: Add sorting */}
							<th><div className="flex items-center">Index <button className="btn btn-xs btn-circle btn-ghost"><ChevronsUpDown className="w-4 h-4 opacity-50" /></button></div></th>
							<th><div className="flex items-center">Type <button className="btn btn-xs btn-circle btn-ghost"><ChevronsUpDown className="w-4 h-4 opacity-50" /></button></div></th>
							<th><div className="flex items-center">Status <button className="btn btn-xs btn-circle btn-ghost"><ChevronsUpDown className="w-4 h-4 opacity-50" /></button></div></th>
							<th><div className="flex items-center">Balance <button className="btn btn-xs btn-circle btn-ghost"><ChevronsUpDown className="w-4 h-4 opacity-50" /></button></div></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{paginatedValidators.map((v) => (
							<ValidatorItem
								key={v.index}
								validator={v}
							/>
						))}
						{emptyRows.map((_, index) => (
							<tr key={`empty-${index}`} className="h-14">
								<td></td>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-between w-full px-2">
					<div className="text-sm text-base-content/70">
						Showing {startIndex + 1}-{Math.min(endIndex, filteredValidators.length)} of {filteredValidators.length} validators
					</div>
					<div className="flex items-center gap-2">
						<button
							className="btn btn-sm btn-ghost"
							onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
						<div className="flex items-center gap-1">
							{getVisiblePages().map(page => (
								<button
									key={page}
									className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-ghost'}`}
									onClick={() => setCurrentPage(page)}
								>
									{page}
								</button>
							))}
						</div>
						<button
							className="btn btn-sm btn-ghost"
							onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
							disabled={currentPage === totalPages}
						>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			)}

			<div className="flex w-full justify-end mt-4 border border-base-content/5 rounded-lg p-4 shadow-xs gap-x-4">
				<div className="flex flex-col w-full">
					<p className="text-lg font-bold">Quick consolidation</p>
					<p className="text-xs text-base-content/70">Balance min: {chunkSize}</p>
					<input
						type="range"
						min={network.cl.minBalance}
						max={network.cl.maxBalance}
						value={chunkSize}
						className="range range-sm range-primary mt-2 w-full"
						onChange={(e) => setChunkSize(Number(e.target.value))}
					/>
					<div className="flex justify-between w-full">
						<p className="text-xs text-base-content/70">1 GNO</p>
						<p className="text-xs text-base-content/70">{network.cl.maxBalance} GNO</p>
					</div>
				</div>

				<div className="w-full flex flex-col bg-base-200 rounded-lg p-4">
					<p className="font-semibold mb-2">Consolidation summary</p>
					<div className="flex justify-between text-sm">
						<p className="text-base-content/70">Consolidations request:</p>
						<p className="">{consolidations.length}</p>
					</div>
					<div className="flex justify-between text-sm ">
						<p className="text-base-content/70">Gas fees:</p>
						<p className="">{formatEther(BigInt(consolidations.length) * 1000000000000000000n)} GNO</p>
					</div>
					<div className="flex justify-between text-sm mt-2 border-t border-base-content/5 pt-2 mb-6">
						<p className="text-base-content/70">Validators remaining:</p>
						<p className="">{totalGroups}</p>
					</div>

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
					<ConsolidationSummary consolidations={consolidations} />
				</div>
			</div>
		</div>
	);
}
