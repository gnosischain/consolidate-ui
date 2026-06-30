import { useMemo } from 'react';
import { Consolidation } from '../types/validators';
import { formatEther } from 'viem';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';
import { useModal } from '../context/ModalContext';
import { TransactionButton } from './TransactionButton';

interface ConsolidationSummaryProps {
	consolidations: Consolidation[];
}

export function ConsolidationSummary({ consolidations }: ConsolidationSummaryProps) {
	const { closeModal } = useModal();
	const { buildConsolidateCalls } = useConsolidateValidatorsBatch();

	const calls = useMemo(
		() => buildConsolidateCalls(consolidations),
		[consolidations, buildConsolidateCalls],
	);

	return (
		<>
			<div className="mb-6 flex w-full items-center justify-between">
				<div>
					<h3 className="text-2xl font-bold">Consolidation Details</h3>
					<p className="text-base-content mt-1 text-sm opacity-70">
						Review all consolidation operations before executing
					</p>
				</div>
				<p className="text-base-content text-right text-sm opacity-70">
					{consolidations.length} operations
				</p>
			</div>

			<div className="border-base-300 max-h-96 overflow-y-auto rounded-lg border">
				<table className="table-pin-rows table-zebra table">
					<thead>
						<tr className="bg-base-200">
							<th>#</th>
							<th>Source Index</th>
							<th>Target Index</th>
							<th>Combined Balance</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{consolidations.map((c, i) => (
							<tr key={i} className="text-sm">
								<td>{i + 1}</td>
								<td>{c.sourceIndex}</td>
								<td>{c.targetIndex}</td>
								<td>{Number(formatEther(c.sourceBalance + c.targetBalance)).toFixed(2)} GNO</td>
								<td>
									{c.sourceIndex === c.targetIndex && (
										<p className="text-warning text-xs">Self consolidation</p>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<TransactionButton calls={calls} onSuccess={closeModal} className="btn btn-primary mt-6">
				Consolidate
			</TransactionButton>
		</>
	);
}
