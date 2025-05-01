import { useEffect, useMemo, useState } from 'react';
import { ValidatorInfo } from '../hooks/useBeaconValidators';
import { simulateConsolidation } from '../hooks/useConsolidate';
import { NETWORK_CONFIG } from '../constants/networks';

interface ConsolidateSelectProps {
	validators: ValidatorInfo[];
	consolidateValidators: (
		selectedPubkeys: ValidatorInfo[],
		size: number,
		upgradeAll: boolean,
	) => Promise<void>;
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
	const [upgradeAll, setUpgradeAll] = useState(true);
	const simulation = simulateConsolidation(validators, chunkSize, upgradeAll);

	const handleConsolidate = async () => {
		await consolidateValidators(validators, chunkSize, upgradeAll);
	};

	useEffect(() => setChunkSize(targetBalance), [targetBalance]);

	return (
		<div className="w-full flex flex-col items-center justify-center gap-y-2 p-2">
			<p>{validators.length} validators loaded</p>
			<p className="text-xs">Balance min: {chunkSize}</p>
			<input
				type="range"
				min={network.cl.minBalance}
				max={network.cl.maxBalance}
				value={chunkSize}
				className="range range-sm range-primary"
				onChange={(e) => setChunkSize(Number(e.target.value))}
			></input>

			<label className="label">
				<input
					className="checkbox"
					type="checkbox"
					checked={upgradeAll}
					onChange={(e) => setUpgradeAll(e.currentTarget.checked)}
				/>
				Upgrade all to compounding
			</label>

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
									<li key={v.pubkey}>
										{v.pubkey} ({v.balanceEth} GNO)
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
				<button onClick={handleConsolidate} className="btn btn-primary">
					Consolidate
				</button>
			</div>
		</div>
	);
}
