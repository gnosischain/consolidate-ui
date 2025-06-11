import { useState, useMemo, useRef } from 'react';
import { Consolidation } from '../types/validators';
import { formatEther } from 'viem';

interface ConsolidationSummaryProps {
    consolidations: Consolidation[];
    consolidateValidators: (consolidations: Consolidation[]) => Promise<void>;
}

const BATCH_SIZE = 200;

export function ConsolidationSummary({ consolidations, consolidateValidators }: ConsolidationSummaryProps) {
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

    if (consolidations.length === 0) {
        return null;
    }

    return (
        <>
            <button
                className="btn btn-primary"
                onClick={() => dialogRef.current?.showModal()}
            >
                Summary
            </button>
            <dialog ref={dialogRef} className="modal">
                <div className="modal-box">
                    <div className="overflow-auto h-72">
                        <table className="table">
                            {/* head */}
                            <thead>
                                <tr>
                                    <th>Source</th>
                                    <th>Target</th>
                                    <th>Balance</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {consolidations.map((c, i) => (
                                    <tr key={i}>
                                        <td>{c.sourceIndex}</td>
                                        <td>{c.targetIndex}</td>
                                        <td>{formatEther(c.sourceBalance + c.targetBalance)} GNO</td>
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
                        className="btn btn-primary"
                        disabled={currentBatchIndex >= batches.length}
                    >
                        {currentBatchIndex >= batches.length
                            ? "All Consolidations Complete"
                            : `Consolidate Batch ${currentBatchIndex + 1}/${batches.length}`
                        }
                    </button>
                    {batches.length > 1 && (
                        <p className="text-xs text-center">
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