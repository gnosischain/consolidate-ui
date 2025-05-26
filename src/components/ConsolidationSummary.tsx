import { useRef } from "react";
import { Consolidation } from "../hooks/useConsolidate";

export function ConsolidationSummary({ consolidations, consolidateValidators }: { consolidations: Consolidation[], consolidateValidators: (consolidations: Consolidation[]) => Promise<void> }) {

    const dialogRef = useRef<HTMLDialogElement>(null);
    const handleConsolidate = async () => {
        await consolidateValidators(consolidations);
    };

    return (
        <>
            <button
                disabled={consolidations.length === 0}
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
                                        <td>{c.sourceBalance + c.targetBalance} GNO</td>
                                        <td>{c.sourceIndex === c.targetIndex && (
                                            <p className="text-warning text-xs">Self consolidation</p>
                                        )}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={handleConsolidate} className="btn btn-primary">
                        Consolidate
                    </button>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    )
}