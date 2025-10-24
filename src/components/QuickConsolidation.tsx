import { formatEther, parseEther } from "viem";
import { ConsolidationSummary } from "./ConsolidationSummary";
import { useEffect, useMemo, useState } from "react";
import { computeConsolidations } from "../hooks/useConsolidate";
import { ValidatorInfo } from "../types/validators";
import { useWallet } from "../context/WalletContext";
import ModalButton from "./ModalButton";

interface QuickConsolidationProps {
    validators: ValidatorInfo[];
}

export default function QuickConsolidation({ validators }: QuickConsolidationProps) {
    const { network } = useWallet();
    if (!network) {
        throw new Error('Network not found');
    }
    const targetBalance = network.cl.maxBalance * 0.625;
    const [chunkSize, setChunkSize] = useState(targetBalance);
    const { consolidations, totalGroups, skippedValidators } = useMemo(() => {
        const type1Filtered = validators.filter(
            (v) => v.type === 1 && v.filterStatus === 'active'
        );
        const compoundingFiltered = validators.filter(
            (v) => v.type === 2 && v.filterStatus === 'active'
        );

        const { consolidations, skippedValidators, targets } = computeConsolidations(compoundingFiltered, type1Filtered, parseEther(chunkSize.toString()));
        const totalGroups = targets.size + skippedValidators.length;

        return { consolidations, totalGroups, skippedValidators };
    }, [validators, chunkSize]);

    useEffect(() => setChunkSize(targetBalance), [targetBalance]);

    return (
        <>
            <div className="flex flex-col w-full">
                <p className="text-lg font-bold">Quick consolidation</p>
                <p className="text-xs text-base-content/70">Balance min: {chunkSize}</p>
                <input
                    type="range"
                    min={network.cl.minBalance}
                    max={network.cl.maxBalance}
                    value={chunkSize}
                    className="range range-sm range-primary mt-8 w-full"
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                />
                <div className="flex justify-between w-full">
                    <p className="text-xs text-base-content/70">1 GNO</p>
                    <p className="text-xs text-base-content/70">{network.cl.maxBalance} GNO</p>
                </div>
            </div>

            <div className="w-full flex flex-col bg-base-200 rounded-lg p-4 mt-8">
                <p className="font-semibold mb-2">Consolidation summary</p>
                <div className="flex justify-between text-sm">
                    <p className="text-base-content/70">Consolidations request:</p>
                    <p className="">{consolidations.length}</p>
                </div>
                <div className="flex justify-between text-sm ">
                    <p className="text-base-content/70">Pocessing fees:</p>
                    <p className="">{consolidations.length * 0.000001} GNO</p>
                </div>
                <div className="flex justify-between text-sm mt-2 border-t border-base-content/5 pt-2 mb-6">
                    <p className="text-base-content/70">Validators remaining:</p>
                    <p className="">{totalGroups}</p>
                </div>

                {skippedValidators.length > 0 && (
                    <div className="mt-2">
                        <p className="text-warning text-sm">
                            {skippedValidators.length} validators skipped
                        </p>
                        <ul className="list-disc list-inside text-xs mt-1">
                            {skippedValidators.map((v) => (
                                <li key={v.index}>
                                    {v.index} ({Number(formatEther(v.balanceEth)).toFixed(2)} GNO)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <ModalButton title="Summary" children={<ConsolidationSummary consolidations={consolidations} />} />
            </div>
        </>
    );
}