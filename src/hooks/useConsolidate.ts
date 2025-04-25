import { useCallback } from "react";
import { useSendCalls, } from "wagmi";
import { Address, concat, parseEther } from "viem";

export type Validator = {
    publickey: `0x${string}`;
    valid_signature: boolean;
    validatorindex: number;
    withdrawal_credentials: `0x${string}`;
};


export async function fetchValidators(beaconExplorerUrl: string, address: string): Promise<Validator[]> {
    try {
        const response = await fetch(`${beaconExplorerUrl}/api/v1/validator/eth1/${address}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch from ${beaconExplorerUrl} - status: ${response.status}`);
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Error fetching validator statuses:", error);
        throw error;
    }
}

export function useConsolidateValidatorsBatch(
    contract: Address,
) {
    const { sendCalls } = useSendCalls();
    // const { data: hash, sendTransaction } = useSendTransaction();

    const consolidateValidators = useCallback(
        async (
            selectedPubkeys: `0x${string}`[],
            chunkSize: number
        ) => {
            // try {
            //     const data = concat([
            //         selectedPubkeys[0],
            //         selectedPubkeys[1],
            //     ]);
            //     sendTransaction({
            //         to: contract,
            //         data,
            //         value: parseEther('0.01'),
            //     });

            // } catch (err) {
            //     console.error("Error consolidating validators:", err);
            // }

            if (selectedPubkeys.length < 2) {
                throw new Error('Need at least 2 validators to consolidate.')
            }

            const calls = []

            const total = selectedPubkeys.length
            const numChunks = Math.ceil(total / chunkSize)

            for (let i = 0; i < numChunks; i++) {
                const start = i * chunkSize
                const end = Math.min(start + chunkSize, total)

                const chunk = selectedPubkeys.slice(start, end)

                if (chunk.length < 2) continue

                const target = chunk[0]
                const sources = chunk.slice(1)

                for (const source of sources) {
                    const data = concat([source, target])

                    console.log(`Consolidate ${source} into ${target}`)
                    console.log('LOG DATA:', data)

                    calls.push({
                        to: contract,
                        data,
                        value: parseEther('0.001'),
                    })
                }
            }

            console.log('Sending batch of', calls.length, 'calls')

            await sendCalls({
                calls,
                capabilities: {}
            })
        },
        [contract, sendCalls]
    )

    return { consolidateValidators }
}