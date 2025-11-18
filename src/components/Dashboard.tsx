import { useEffect, useMemo, useState } from 'react';
import Loader from './Loader';
import { ConsolidateAggregate } from './ConsolidateAggregate';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';
import { useBeaconValidators } from '../hooks/useBeaconValidators';
import { Address, formatEther } from 'viem';
import { useWallet } from '../context/WalletContext';
import Deposit from './Deposit';
import { WarningModal } from './WarningModal';
import { Plus } from 'lucide-react';
import { useModal } from '../context/ModalContext';

enum Steps {
	SELECT = 'select',
	SUMMARY = 'summary',
}

export default function Dashboard() {
	const { account, network, isMounted } = useWallet();
	const { openModal } = useModal();
	const { callStatusData } = useConsolidateValidatorsBatch();

	const { validators, loading } = useBeaconValidators(network, account.address);

	const totalBalance = useMemo(() => {
		return validators.filter(v => v.filterStatus === 'active').reduce((acc, v) => acc + v.balanceEth, 0n);
	}, [validators]);

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
					{isMounted && network && <WarningModal totalBalance={totalBalance} network={network} />}
					<div className='rounded-box backdrop-blur-sm bg-white/80 shadow-xs sm:p-6 mb-10'>
						<div className='flex justify-between items-center w-full'>
							<div className="flex flex-col gap-2">
								<div className="flex items-center gap-3">
									<h1 className="text-lg sm:text-2xl font-bold">Validator Portfolio</h1>
									<span className="hidden sm:inline badge badge-accent badge-sm">{validators.filter(v => v.filterStatus === 'active').length} Active</span>
								</div>
								<p className="hidden sm:inline text-sm text-base-content/60">Manage your validators and track your rewards</p>
							</div>
							<div className="flex flex-col sm:flex-row items-center gap-4">
								<div className="flex flex-col items-end">
									<p className="text-xs text-base-content/60 mb-1">Total validators balance</p>
									<p className="font-bold text-2xl">{Number(formatEther(totalBalance)).toFixed(2)} GNO</p>
								</div>
								<button
									className="btn btn-accent btn-sm sm:btn-md"
									onClick={() => openModal(<Deposit />)}
								>
									<Plus />
									Add Validator
								</button>
							</div>
						</div>
					</div>
					<ConsolidateAggregate
						validators={validators}
					/>
				</div>
			)}
		</>
	);
}
