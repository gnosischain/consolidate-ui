import { Statistics } from '../types/statistics';

interface StatisticsTableProps {
	statistics: Statistics;
}

export function StatisticsTable({ statistics }: StatisticsTableProps) {
	console.log(statistics);

	return (
		<div className="flex items-center justify-between gap-x-2 rounded-lg">
			<div className="flex flex-col">
				<p className="text-sm font-light">GNO Balance</p>
				<p className="text-2xl font-bold">
					{/* {Number(formatEther(balance.balance)).toFixed(2)} */}
				</p>
			</div>
			<div className="flex flex-col">
				<p className="text-sm font-light">Ready to claim</p>
				<div className="flex items-center gap-x-2">
					<p className="text-2xl font-bold">
						{/* {Number(formatEther(balance.claimBalance)).toFixed(2)} */}
					</p>
					{/* <button className="btn btn-primary btn-xs" onClick={balance.claim} disabled={balance.claimBalance === 0n}>Claim</button> */}
				</div>
			</div>
		</div>
	);
}
