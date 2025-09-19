import { useEffect, useMemo, useState } from 'react';
import Loader from './Loader';
import { ConsolidateAggregate } from './ConsolidateAggregate';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';
import { useBeaconValidators } from '../hooks/useBeaconValidators';
import { Address, formatEther } from 'viem';
import { useWallet } from '../context/WalletContext';
import WithdrawBatch from './WithdrawBatch';
import Deposit from './Deposit';
import { WarningModal } from './WarningModal';

enum Steps {
	SELECT = 'select',
	SUMMARY = 'summary',
}

export default function Dashboard() {
	const { account, network } = useWallet();
	if (!network || !account.address) {
		throw new Error('Network or account not found');
	}
	const { callStatusData } = useConsolidateValidatorsBatch(
		network.consolidateAddress,
	);

	const { validators, loading } = useBeaconValidators(network, account.address);

	const totalBalance = useMemo(() => {
		return validators.filter(v => v.filterStatus === 'active').reduce((acc, v) => acc + v.balanceEth, 0n);
	}, [validators]);

	const compoundingValidatorsActive = validators.filter(
		(v) => v.type === 2 && v.filterStatus === 'active'
	);

	const totalCompoundingBalance = useMemo(() => {
		return compoundingValidatorsActive.reduce((acc, v) => acc + v.balanceEth, 0n);
	}, [compoundingValidatorsActive]);

	const [state, setState] = useState<{
		step: Steps;
		loading: boolean;
		tx: Address;
	}>({
		step: Steps.SELECT,
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

	return (
		<>
			{state.loading || loading ? (
				<div className="w-full flex flex-col items-center justify-center gap-y-2 p-2">
					<Loader />
					<p className="mt-2">Loading...</p>
				</div>
			) : (
				<div className='flex flex-col w-full'>
					<WarningModal totalBalance={totalBalance} network={network} />
					<div className='flex justify-between w-full mb-8'>
						<div className="flex flex-col">
							<p className="text-xl font-bold">Validator Portfolio</p>
							<p className="text-sm text-gray-500">Manage your validators and track your rewards</p>
						</div>
						<div className="flex space-x-3 items-end">
							<div className="flex flex-col items-end">
								<p className="text-sm text-gray-500">Total validators balance</p>
								<p className="font-semibold text-xl">{Number(formatEther(totalBalance)).toFixed(2)} GNO</p>
							</div>
							<WithdrawBatch validators={compoundingValidatorsActive} totalBalance={totalCompoundingBalance} />
							{(network.chainId === 100 || network.chainId === 10200) && <Deposit />}
						</div>
					</div>
					<ConsolidateAggregate
						validators={validators}
						network={network}
						goToStep={() => setState((prev) => ({ ...prev, step: Steps.SUMMARY }))}
					/>
				</div>
			)}
		</>
	);
}
