import { useState, useEffect } from "react";
import { Address } from "viem";

/**
 * Type representing a Beacon chain validator for a given address.
 */
export interface ValidatorInfo {
    index: number;
    pubkey: Address;
    balanceEth: number;
    withdrawal_credentials: Address;
}

/**
 * React hook to fetch Beacon chain validators associated with the connected wallet address.
 *
 * @param beaconApiUrl - Full URL to the Beacon node API endpoint, e.g.
 *                       "https://eth-holesky.alchemyapi.io/v2/YOUR_KEY/eth/v1/beacon/states/head/validators"
 * @returns An object containing:
 *   - validators: Array of ValidatorInfo
 *   - loading: boolean while the request is in progress
 *   - error: any error encountered during fetch
 */
export function useBeaconValidators(beaconExplorerUrl: string, address: Address) {
    const [validators, setValidators] = useState<ValidatorInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const fetchValidators = async () => {
            // setLoading(true);
            setError(null);

            const dummyData: ValidatorInfo[] = [
                {
                    pubkey: "0xb200c56e51726a46fb72ef48dfe38a424be38c8fc178ab927a2f7f694c1baf012c1faefd3e0f6fca1b2e4f5ec62a5d87",
                    withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
                    index: 0,
                    balanceEth: 32000000000
                },
                {
                    pubkey: "0xb6d142405a25a20600b4f7fed98b4c999dd94e46b7abc4d86b6599cbd02ebae058f0bd82ae48f2143f91ff07596f3aa1",
                    withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
                    index: 0,
                    balanceEth: 32000000000
                },

                {
                    pubkey: "0xb20dd7edd18b280183270258e25cee251da879e63d5f9b2a4f325d53a8333027d8c0c19f388541983069c6f5cc5eecec",
                    withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
                    index: 0,
                    balanceEth: 32000000000
                },

                {
                    pubkey: "0xb0693b463eff337f8e8ea1d676062297f61f56fca4e09bbc818713bad6f238e5e69ccd58d02e1df151df5f75e41417d4",
                    withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
                    index: 0,
                    balanceEth: 32000000000
                },
            ];
            setValidators(dummyData);
            return;

            try {
                // Normalize the address: remove 0x prefix and lowercase
                const addrHex = address.toLowerCase().replace(/^0x/, "");

                const res = await fetch(beaconExplorerUrl);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status} - ${res.statusText}`);
                }

                const json = await res.json();
                const data = json.data;

                const filtered: ValidatorInfo[] = data
                    .filter((v: { validator: { withdrawal_credentials: string } }) => {
                        const creds: string = v.validator.withdrawal_credentials;
                        return creds.startsWith("0x00") && creds.slice(2, 2 + addrHex.length) === addrHex;
                    })
                    .map((v: { index: string; validator: { pubkey: Address }; balance: string }) => ({
                        index: Number(v.index),
                        pubkey: v.validator.pubkey,
                        balanceEth: Number(v.balance) / 1e9
                    }));

                setValidators(filtered);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchValidators();
    }, [beaconExplorerUrl, address]);

    return { validators, loading, error };
}
