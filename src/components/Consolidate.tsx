import { useEffect, useState } from 'react';
import Loader from './Loader';
import { ConsolidateInfo } from './ConsolidateInfo';
import { ConsolidateAggregate } from './ConsolidateAggregate';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';
import { NetworkConfig } from '../constants/networks';
import { useBeaconValidators } from '../hooks/useBeaconValidators';

interface ConsolidateProps {
	address: `0x${string}`;
	network: NetworkConfig;
}

enum Steps {
	INFO = 'info',
	SELECT = 'select',
	SUMMARY = 'summary',
}

export default function Consolidate({ network, address }: ConsolidateProps) {
	const { consolidateValidators, isConfirming, isConfirmed } = useConsolidateValidatorsBatch(
		network.consolidateAddress,
	);

	const { validators, loading } = useBeaconValidators(network, address);

	const [state, setState] = useState<{
		step: Steps;
		loading: boolean;
		tx: `0x${string}`;
	}>({
		step: Steps.INFO,
		loading: false,
		tx: '0x0',
	});

	useEffect(() => {
		if (isConfirmed) {
			setState((prev) => ({ ...prev, step: Steps.SUMMARY }));
		}
	}, [isConfirmed]);

	useEffect(() => {
		if (isConfirming) {
			setState((prev) => ({ ...prev, loading: true }));
		}

		if (!isConfirming) {
			setState((prev) => ({ ...prev, loading: false }));
		}
	}, [isConfirming]);
	const renderStep = () => {
		switch (state.step) {
			case Steps.INFO:
				return (
					<ConsolidateInfo
						pubkeysAmount={validators.length}
						goToStep={() => setState((prev) => ({ ...prev, step: Steps.SELECT }))}
					/>
				);
			case Steps.SELECT:
				return (
					<ConsolidateAggregate
						validators={validators}
						consolidateValidators={consolidateValidators}
						chainId={network.chainId}
						goToStep={() => setState((prev) => ({ ...prev, step: Steps.SUMMARY }))}
					/>
				);
			case Steps.SUMMARY:
				return (
					<div className="w-full flex flex-col items-center justify-center gap-y-2 p-2">
						<p>Transaction sent</p>
						<p className="text-xs">Transaction hash:</p>
						<a
							href={`${network.explorerUrl}/tx/${state.tx}`}
							target="_blank"
							rel="noreferrer"
							className="text-primary"
						>
							{state.tx}
						</a>
						<p className="text-xs">Check the transaction on the explorer</p>
						<button
							className="btn btn-primary mt-2"
							onClick={() => {
								setState((prev) => ({ ...prev, step: Steps.INFO }));
							}}
						>
							Finish
						</button>
					</div>
				);
		}
	};

	return (
		<>
			{state.loading || loading ? (
				<div className="w-full flex flex-col items-center justify-center gap-y-2 p-2">
					<Loader />
					<p className="mt-2">Loading...</p>
				</div>
			) : (
				renderStep()
			)}
		</>
	);
}
