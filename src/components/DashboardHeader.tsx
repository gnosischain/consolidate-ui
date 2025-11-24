import { formatEther } from 'viem';
import { Plus, ChevronRight } from 'lucide-react';
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
        <div className='flex p-5 flex-col-reverse md:flex-row w-full bg-base-100 backdrop-blur-sm rounded-box shadow-xs mb-10 gap-y-5'>
             <div 
                onClick={handleOpenAutoclaim}
                className='group w-full md:w-80 bg-base-50/50 cursor-pointer md:border-r border-black/10 md:pr-5 md:mr-5 flex flex-col justify-between gap-y-2'
            >
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest text-base-content/40">AUTOCLAIM MODULE</span>
                    <div className={`status ${isRegistered ? 'status-success' : ''}`} />
                </div>

                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors duration-200 ${isRegistered ? '' : 'bg-base-200/50 text-base-content/40 group-hover:bg-base-200 group-hover:text-base-content/60'}`}>
                        {autoclaimStatus.icon}
                    </div>
                    <div className="flex flex-col">
                         <span className={`font-bold text-sm leading-tight transition-colors duration-200 ${isRegistered ? 'text-base-content' : 'text-base-content/60 group-hover:text-base-content'}`}>
                            {autoclaimStatus.detail}
                         </span>
                         <span className="text-[10px] font-medium text-base-content/50">
                            {autoclaimStatus.status}
                         </span>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto text-base-content/20 group-hover:text-base-content/40 group-hover:translate-x-0.5 transition-all" />
                </div>
                
                <p className="text-[10px] text-base-content/40 leading-relaxed">
                    {isRegistered 
                        ? 'Rewards sent to wallet automatically.' 
                        : 'Configure automatic reward claiming.'}
                </p>
            </div>

            <div className="flex flex-col w-full gap-y-3 h-full">
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
                        <span className="font-semibold">{activeValidatorsCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
