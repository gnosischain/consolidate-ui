import { Consolidation } from '../types/validators';
import { formatEther } from 'viem';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';
import { useModal } from '../context/ModalContext';
import { useTransactionToast } from '../hooks/useTransactionToast';

interface ConsolidationSummaryProps {
    consolidations: Consolidation[];
}

export function ConsolidationSummary({ consolidations }: ConsolidationSummaryProps) {
    const { consolidateValidators, isPending, isSuccess, error } = useConsolidateValidatorsBatch();
    const { closeModal } = useModal();

    useTransactionToast({
        isPending,
        isSuccess,
        error,
        loadingMessage: 'Consolidating...',
        successMessage: 'Consolidation successful',
        onSuccess: closeModal,
    });

    const handleConsolidate = async () => {
        await consolidateValidators(consolidations);
    };

    return (
        <>
            <div className="flex w-full items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-2xl">Consolidation Details</h3>
                    <p className="text-sm text-base-content opacity-70 mt-1">
                        Review all consolidation operations before executing
                    </p>
                </div>
                <p className="text-sm text-base-content opacity-70 text-right">
                    {consolidations.length} operations
                </p>
            </div>

            <div className="max-h-96 overflow-y-auto border border-base-300 rounded-lg">
                <table className="table table-pin-rows table-zebra">
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
                                <td>{c.sourceIndex === c.targetIndex && (
                                    <p className="text-warning text-xs">Self consolidation</p>
                                )}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                onClick={handleConsolidate}
                className="btn btn-primary mt-6"
            >
                {isPending ? 'Consolidating...' : 'Consolidate'}
            </button>
        </>
    )
}