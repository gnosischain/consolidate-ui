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
import Image from 'next/image';

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
		return validators.filter(v => v.filterStatus === 'active').reduce((acc, v) => acc + v.balance, 0n);
	}, [validators]);

	const totalEffectiveBalance = useMemo(() => {
		return validators.filter(v => v.filterStatus === 'active').reduce((acc, v) => acc + v.effectiveBalance, 0n);
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

	const [currentYield, setCurrentYield] = useState<number | null>(null);
	const [yieldLoading, setYieldLoading] = useState(true);

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

	useEffect(() => {
		const fetchYield = async () => {
			try {
				const response = await fetch('https://dune-proxy.gnosischain.com/current-yield');
				if (!response.ok) {
					throw new Error('Failed to fetch yield data');
				}
				const data = await response.json();
				const yieldValue = data.result.rows[0]?.yield;
				setCurrentYield(yieldValue || null);
			} catch (error) {
				console.error('Error fetching yield:', error);
				setCurrentYield(null);
			} finally {
				setYieldLoading(false);
			}
		};

		fetchYield();
	}, []);

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
					<div className='rounded-box backdrop-blur-sm bg-white/80 shadow-xs p-5 sm:p-6 mb-10'>
						{/* First row: Total staked + Add Validator */}
						<div className='flex justify-between items-center w-full mb-4'>
							<div className="flex items-center gap-4">
								<span className="text-sm font-medium text-base-content/60">Total staked</span>
								<span className="text-2xl font-bold">{Number(formatEther(totalBalance)).toFixed(2)} GNO</span>
								<span className="flex items-center bg-secondary/10 pl-2 rounded-l-xl gap-1">
									<span className="text-xs">↻</span>
									<span className="text-xs">Autoclaim configured: </span>
									<button className="px-3 py-1 bg-black/90 rounded-xl opacity-85 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
										<Image src="/gnosis-pay.svg" alt="Gnosis Pay" width={86} height={86} />
									</button>
								</span>
							</div>
							{/* <button className="btn btn-soft btn-primary btn-sm">Add GNOs</button>
							<button className="btn btn-soft btn-primary btn-sm">Remove GNOs</button> */}
							<button
								className="btn btn-accent btn-sm"
								onClick={() => openModal(<Deposit />)}
							>
								<Plus className="w-4 h-4" />
								Add Validator
							</button>
						</div>

						{/* Second row: Metrics */}
						<div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
							<span className="text-base-content/50">Effective balance</span>
							<span className="font-semibold text-base-content/90">{Number(formatEther(totalEffectiveBalance)).toFixed(2)} GNO</span>

							<span className="text-base-content/30">•</span>

							<span className="text-base-content/50">Daily</span>
							
							{/* TODO: handle rounding */}
							<span className="font-semibold text-secondary">+ {currentYield ? (currentYield * Number(formatEther(totalEffectiveBalance)) / 100 / 365).toFixed(5) : '0.00'} GNO</span>
							<span className="text-base-content/40 text-xs">({yieldLoading ? '...' : currentYield ? currentYield.toFixed(2) : '0.00'}% APY)</span>

							<span className="text-base-content/30">•</span>

							<span className="text-base-content/50">Active validators</span>
							<span className="font-semibold text-secondary">{validators.filter(v => v.filterStatus === 'active').length}</span>
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
