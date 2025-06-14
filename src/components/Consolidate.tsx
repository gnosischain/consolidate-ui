import { useEffect, useState } from 'react';
import Loader from './Loader';
import { ConsolidateInfo } from './ConsolidateInfo';
import { ConsolidateAggregate } from './ConsolidateAggregate';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';
import { useBeaconValidators } from '../hooks/useBeaconValidators';
import { Address } from 'viem';
import { FilterStatus } from '../types/validators';
import { useWithdraw } from '../hooks/useWithdraw';
import { useWallet } from '../context/WalletContext';

enum Steps {
	INFO = 'info',
	SELECT = 'select',
	SUMMARY = 'summary',
}

export default function Consolidate() {
	const { account, network } = useWallet();
	if (!network || !account.address) {
		throw new Error('Network or account not found');
	}
	const { consolidateValidators, callStatusData } = useConsolidateValidatorsBatch(
		network.consolidateAddress,
	);

	const { withdrawalValidators, computeWithdrawals } = useWithdraw(network);

	const { validators, loading } = useBeaconValidators(network, account.address);

	const [state, setState] = useState<{
		step: Steps;
		loading: boolean;
		tx: Address;
	}>({
		step: Steps.INFO,
		loading: false,
		tx: '0x0',
	});

	useEffect(() => {
		if (callStatusData?.status === 'success') {
			console.log('Transaction confirmed');
			setState((prev) => ({
				...prev,
				step: Steps.SUMMARY,
				loading: false,
				tx: callStatusData.id as Address,
			}));
		} else {
			if (callStatusData?.status === 'pending') {
				setState((prev) => ({ ...prev, loading: true }));
			}
		}
	}, [callStatusData?.id, callStatusData?.status]);

	const renderStep = () => {
		switch (state.step) {
			case Steps.INFO:
				return (
					<ConsolidateInfo
						pubkeysAmount={validators.filter((v) => v.filterStatus === FilterStatus.ACTIVE).length}
						goToStep={() => setState((prev) => ({ ...prev, step: Steps.SELECT }))}
					/>
				);
			case Steps.SELECT:
				return (
					<ConsolidateAggregate
						validators={validators}
						consolidateValidators={async (consolidations) => {
							consolidateValidators(consolidations);
						}}
						withdrawalValidators={async (withdrawal) => {
							withdrawalValidators(withdrawal);
						}}
						network={network}
						goToStep={() => setState((prev) => ({ ...prev, step: Steps.SUMMARY }))}
						computeWithdrawals={computeWithdrawals}
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
