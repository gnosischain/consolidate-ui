import { useEffect, useMemo, useState } from 'react';
import {
	computeSelfConsolidations,
	useConsolidateValidatorsBatch,
} from '../hooks/useConsolidate';
import { ValidatorInfo } from '../types/validators';
import { ValidatorItem } from './ValidatorItem';
import { NetworkConfig } from '../types/network';
import { Search, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import QuickConsolidation from './QuickConsolidation';
import ActionBar from './ActionBar';

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
	const [filterVersion, setFilterVersion] = useState<string | undefined>(undefined);
	const [filterStatus, setFilterStatus] = useState<string | undefined>('active');
	const [currentPage, setCurrentPage] = useState(1);
	const [selected, setSelected] = useState<Set<number>>(new Set());

	const itemsPerPage = 10;
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

	const toggleOne = (idx: number, checked: boolean) => {
		setSelected(prev => {
			const next = new Set(prev);
			checked ? next.add(idx) : next.delete(idx);
			return next;
		});
	};

	const toggleAll = (checked: boolean) => {
		setSelected(checked ? new Set(filteredValidators.map(v => v.index)) : new Set());
	};

	const allSelected = useMemo(() => {
		return selected.size === filteredValidators.length;
	}, [selected, filteredValidators]);

	const emptyRows = Array.from({ length: itemsPerPage - paginatedValidators.length }, (_, i) => i);

	useEffect(() => {
		setCurrentPage(1);
		setSelected(new Set());
	}, [filterVersion, filterStatus]);

	const filteredActive = useMemo(
		() => filteredValidators.filter(v => v.filterStatus === 'active'),
		[filteredValidators]
	);

	const handleUpgradeAll = async () => {
		const consolidations = computeSelfConsolidations(type1ValidatorsActive);
		await consolidateValidators(consolidations);
	};

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
							<th><input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} /></th>
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
								isSelected={selected.has(v.index)}
								onToggle={toggleOne}
							/>
						))}
						{emptyRows.map((_, index) => (
							<tr key={`empty-${index}`} className="h-14">
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

			{selected.size > 0 && (
				<ActionBar selected={selected} />
			)}
			{/* <QuickConsolidation network={network} filteredActive={filteredActive} /> */}

		</div>
	);
}
