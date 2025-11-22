import { formatEther } from 'viem';
import { Plus } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import Deposit from './Deposit';
import { ReactNode } from 'react';

interface DashboardHeaderProps {
    totalBalance: bigint;
    totalEffectiveBalance: bigint;
    currentYield: number | null;
    yieldLoading: boolean;
    activeValidatorsCount: number;
    isRegistered: boolean;
    autoclaimStatus: {
        status: string;
        detail: string;
        icon: ReactNode;
    };
    handleOpenAutoclaim: () => void;
}

export default function DashboardHeader({
    totalBalance,
    totalEffectiveBalance,
    currentYield,
    yieldLoading,
    activeValidatorsCount,
    isRegistered,
    autoclaimStatus,
    handleOpenAutoclaim
}: DashboardHeaderProps) {
    const { openModal } = useModal();

    return (
        <div className='flex p-4 flex-col md:flex-row w-full bg-white/80 backdrop-blur-sm rounded-box shadow-xs border border-base-200 mb-10 overflow-hidden'>
            <div className='w-full md:w-[25%] flex flex-col justify-between md:border-r border-black/10 pr-8 mr-8'>
                <span className="text-xs font-bold tracking-wider text-base-content/40">AUTOCLAIM MODULE</span>

                <div onClick={handleOpenAutoclaim} className={`btn flex items-center justify-between ${isRegistered ? 'btn-outline border-black/10' : 'btn-dash'}`}>
                    <div className="flex flex-col gap-0.5">
                        <span className={`text-sm font-bold ${isRegistered ? 'text-base-content' : 'text-base-content/60'}`}>
                            {autoclaimStatus.detail}
                        </span>
                        <span className="text-[10px] font-semibold tracking-wide text-base-content/40" >
                            {autoclaimStatus.status}
                        </span>
                    </div>

                    <div className="flex-shrink-0 ml-3">
                        {autoclaimStatus.icon}
                    </div>
                </div>

                <p className="text-xs text-base-content/40 px-1">
                    {isRegistered ? 'Autoclaim module is active. Tap to configure.' : 'Tap to configure automatic reward claiming to your wallet or Gnosis Pay card.'}
                </p>
            </div>

            <div className="flex flex-col w-full gap-6 h-full justify-between">
                {/* Header Row */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-base-content/60">Total staked</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-base-content">{Number(formatEther(totalBalance)).toFixed(2)} GNO</span>
                        </div>
                    </div>

                    <button
                        className="btn btn-accent btn-sm"
                        onClick={() => openModal(<Deposit />)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Validator
                    </button>
                </div>

                {/* Metrics Row */}
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm'>
                    <div className="flex flex-col">
                        <span className="text-xs text-base-content/50">Effective balance</span>
                        <span className="font-semibold text-base-content/90">{Number(formatEther(totalEffectiveBalance)).toFixed(2)} GNO</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs text-base-content/50">Est. Daily Yield</span>
                        <span className="font-semibold">
                            + {currentYield ? (currentYield * Number(formatEther(totalEffectiveBalance)) / 100 / 365).toFixed(4) : '0.00'} GNO
                            <span className="text-xs text-base-content/50 ml-1">{yieldLoading ? '...' : currentYield ? `${currentYield.toFixed(2)}%` : '0.00%'} APY</span>
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs text-base-content/50">Active validators</span>
                        <span className="font-semibold text-secondary">{activeValidatorsCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

