import { useState, useMemo, useRef } from 'react';
import { Consolidation } from '../types/validators';
import { formatEther } from 'viem';
import { useConsolidateValidatorsBatch } from '../hooks/useConsolidate';

interface ConsolidationSummaryProps {
    consolidations: Consolidation[];
}

const BATCH_SIZE = 200;

export function ConsolidationSummary({ consolidations }: ConsolidationSummaryProps) {

    const { consolidateValidators } = useConsolidateValidatorsBatch();
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

    const dialogRef = useRef<HTMLDialogElement>(null);

    const batches = useMemo(() => {
        const batchCount = Math.ceil(consolidations.length / BATCH_SIZE);
        const batches = Array.from({ length: batchCount }, (_, i) => {
            const start = i * BATCH_SIZE;
            return consolidations.slice(start, start + BATCH_SIZE);
        });
        return batches;
    }, [consolidations]);

    const handleConsolidate = async () => {
        if (currentBatchIndex < batches.length) {
            await consolidateValidators(batches[currentBatchIndex]);
            setCurrentBatchIndex(prev => prev + 1);
        }
    };

    return (
        <>
            <button
                className="btn btn-primary"
                onClick={() => dialogRef.current?.showModal()}
            >
                Summary
            </button>

            <dialog ref={dialogRef} className="modal">
                <div className="modal-box max-w-4xl">
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
                        disabled={currentBatchIndex >= batches.length}
                    >
                        {currentBatchIndex >= batches.length
                            ? "All Consolidations Complete"
                            : `Consolidate Batch ${currentBatchIndex + 1}/${batches.length}`
                        }
                    </button>
                    {batches.length > 1 && (
                        <p className="text-xs mt-2">
                            Processing in batches of {BATCH_SIZE} consolidations
                        </p>
                    )}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    )
}