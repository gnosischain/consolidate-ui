import { useCallback } from "react";
import { useSendCalls, useWaitForTransactionReceipt, } from "wagmi";
import { Address, concat, parseEther } from "viem";
import { ValidatorInfo } from "./useBeaconValidators";

export type Validator = {
    publickey: `0x${string}`;
    valid_signature: boolean;
    validatorindex: number;
    withdrawal_credentials: `0x${string}`;
};

interface Consolidation {
    source: Address
    target: Address
}

interface ComputedConsolidation {
    consolidations: Consolidation[]
    skippedValidators: ValidatorInfo[]
}

export function computeConsolidations(
    validators: ValidatorInfo[],
    chunkSize: number
): ComputedConsolidation {
    const consolidations: Consolidation[] = []
    const skippedValidators: ValidatorInfo[] = []

    const remaining = [...validators]

    while (remaining.length > 0) {
        const target = remaining.shift()!
        let targetBalance = target.balanceEth

        if (targetBalance >= chunkSize) {
            skippedValidators.push(target)
            continue
        }

        for (let i = 0; i < remaining.length;) {
            const candidate = remaining[i]

            if (targetBalance + candidate.balanceEth <= chunkSize) {
                consolidations.push({
                    source: candidate.pubkey,
                    target: target.pubkey,
                })
                targetBalance += candidate.balanceEth
                remaining.splice(i, 1)
            } else {
                i++
            }

            if (targetBalance >= chunkSize) {
                break
            }
        }
    }

    return { consolidations, skippedValidators }
}

interface ConsolidationSimulationResult {
    totalGroups: number
    consolidations: Consolidation[]
    skippedValidators: ValidatorInfo[]
}

export function simulateConsolidation(
    validators: ValidatorInfo[],
    chunkSize: number
): ConsolidationSimulationResult {
    const { consolidations, skippedValidators } = computeConsolidations(validators, chunkSize)

    const targetsInvolved = new Set(consolidations.map((c) => c.target))

    return {
        totalGroups: targetsInvolved.size + skippedValidators.length,
        consolidations,
        skippedValidators,
    }
}

export function useConsolidateValidatorsBatch(
    contract: Address,
) {
    const { data: hash, sendCalls } = useSendCalls();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: hash?.id as Address })

    const consolidateValidators = useCallback(
        async (
            validators: ValidatorInfo[],
            chunkSize: number
        ) => {
            if (validators.length < 2) {
                throw new Error('Need at least 2 validators to consolidate.')
            }

            const { consolidations } = computeConsolidations(validators, chunkSize)

            if (consolidations.length === 0) {
                throw new Error('No consolidation possible with given chunk size')
            }

            const calls = consolidations.map(({ source, target }) => ({
                to: contract,
                data: concat([source, target]),
                value: parseEther('0.0003'),
            }))

            console.log('Sending batch of', calls.length, 'calls')

            sendCalls({
                calls,
                capabilities: {},
            })

        },
        [contract, sendCalls]
    )

    return { consolidateValidators, isConfirming, isConfirmed }
}