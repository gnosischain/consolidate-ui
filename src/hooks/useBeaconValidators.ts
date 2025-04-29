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

export function useBeaconValidators(beaconExplorerUrl: string, address: Address, api: boolean) {
    const [validators, setValidators] = useState<ValidatorInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const fetchValidators = async () => {
            setLoading(true);
            // setError(null);

            // const dummyData: ValidatorInfo[] = [
            //     {
            //         pubkey: "0xb200c56e51726a46fb72ef48dfe38a424be38c8fc178ab927a2f7f694c1baf012c1faefd3e0f6fca1b2e4f5ec62a5d87",
            //         withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
            //         index: 0,
            //         balanceEth: 1
            //     },
            //     {
            //         pubkey: "0xb6d142405a25a20600b4f7fed98b4c999dd94e46b7abc4d86b6599cbd02ebae058f0bd82ae48f2143f91ff07596f3aa1",
            //         withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
            //         index: 0,
            //         balanceEth: 1
            //     },

            //     {
            //         pubkey: "0xb20dd7edd18b280183270258e25cee251da879e63d5f9b2a4f325d53a8333027d8c0c19f388541983069c6f5cc5eecec",
            //         withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
            //         index: 0,
            //         balanceEth: 1
            //     },

            //     {
            //         pubkey: "0xb0693b463eff337f8e8ea1d676062297f61f56fca4e09bbc818713bad6f238e5e69ccd58d02e1df151df5f75e41417d4",
            //         withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
            //         index: 0,
            //         balanceEth: 1
            //     },
            // ];
            // setValidators(dummyData);
            // return;

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

        const fetchValidatorsApi = async () => {
            setLoading(true);

            try {
                const response = await fetch(`https://gnosischa.in/api/v1/validator/eth1/${address}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch from ${beaconExplorerUrl} - status: ${response.status}`);
                }

                const { data: list }: { data: { publickey: string; validator_index: number }[] } =
                    await response.json();


                if (list.length === 0) {
                    setValidators([]);
                    return;
                }

                const batches = chunkArray(
                    list.map((v) => v.publickey),
                    100
                );

                const batchPromises = batches.map((pubkeys) =>
                    fetchValidatorDetailsBatch(pubkeys)
                );
                const batchResults = await Promise.all(batchPromises);

                setValidators(batchResults.flat());
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (api) { fetchValidatorsApi(); } else { fetchValidators(); }
    }, [beaconExplorerUrl, address, api]);

    return { validators, loading, error };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

const fetchValidatorDetailsBatch = async (pubkeys: string[]) => {
    const url = `https://gnosischa.in/api/v1/validator/${pubkeys.join(",")}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Erreur ${resp.status} sur GET ${url}`);
    }
    const body: {
      data: Array<{
        validatorindex: number;
        pubkey: string;
        effectivebalance: number;
        withdrawalcredentials: string;
      }>;
    } = await resp.json();
  
    return body.data.map((d) => ({
      index: d.validatorindex,
      pubkey: d.pubkey as Address,
      balanceEth: d.effectivebalance / 32 / 1e9,
      withdrawal_credentials: d.withdrawalcredentials as Address,
    }));
  };