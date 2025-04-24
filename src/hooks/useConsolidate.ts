import { useCallback } from "react";
import { useAccount,  } from "wagmi";
import { Address, concat, parseEther, toHex } from "viem";

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

export async function fetchChiadoValidators(address: string): Promise<Validator[]> {
  try {
    // const response = await fetch("https://rpc-gbc.chiadochain.net/eth/v1/beacon/states/finalized/validators?status=active");
    // if (!response.ok) {
    //   throw new Error(`Failed to fetch Chiado Validators - status: ${response.status}`);
    // }

    // const data = await response.json();
    // return data.data.filter((v: any) => v.validator.withdrawal_credentials.includes(address.toLowerCase().slice(2))).map((v: any) => {
    //   const { pubkey, ...rest } = v.validator;
    //   return { ...rest, publickey: pubkey };
    // }) || [];

    const dummyData: Validator[] = [
      {
        publickey: "0xb200c56e51726a46fb72ef48dfe38a424be38c8fc178ab927a2f7f694c1baf012c1faefd3e0f6fca1b2e4f5ec62a5d87",
        valid_signature: true,
        validatorindex: 1,
        withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
      },
      {
        publickey: "0xb6d142405a25a20600b4f7fed98b4c999dd94e46b7abc4d86b6599cbd02ebae058f0bd82ae48f2143f91ff07596f3aa1",
        valid_signature: false,
        validatorindex: 2,
        withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
      },

      {
        publickey: "0xb20dd7edd18b280183270258e25cee251da879e63d5f9b2a4f325d53a8333027d8c0c19f388541983069c6f5cc5eecec",
        valid_signature: false,
        validatorindex: 3,
        withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
      },

      {
        publickey: "0xb0693b463eff337f8e8ea1d676062297f61f56fca4e09bbc818713bad6f238e5e69ccd58d02e1df151df5f75e41417d4",
        valid_signature: false,
        validatorindex: 4,
        withdrawal_credentials: "0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd",
      },
    ];
    return dummyData;
  } catch (error) {
    console.error("Error fetching validator statuses:", error);
    throw error;
  }
}

// export function useConsolidateValidators(contract: Address, address: Address) {
//   const { data: hash, sendTransaction } = useSendTransaction();

//   const consolidateValidators = useCallback(
//     async (selectedPubkeys: `0x${string}`[], target: `0x${string}`) => {

//       try {
//         const data = concat([
//           selectedPubkeys[0],
//           target,
//         ]);
//         console.log(selectedPubkeys[0], target, data);
//         sendTransaction({
//           to: contract,
//           data,
//           value: parseEther('0.01'),
//         });

//       } catch (err) {
//         console.error("Error consolidating validators:", err);
//       }
//     },
//     [contract, sendTransaction]
//   );

//   return { consolidateValidators };
// }

export function useConsolidateValidatorsBatch(
  contract: Address,
  chainId: number = 10200,
) {
  const { address } = useAccount()

  const consolidateValidators = useCallback(
    async (
      selectedPubkeys: `0x${string}`[],
      size: number
    ) => {
      if (!address) throw new Error('No account connected')

      const total   = selectedPubkeys.length
      const batches = Math.ceil(total / size)
      const targets = selectedPubkeys.slice(0, batches)
      const calls   = targets.map((target, i) => {
        const start = i * size
        const end   = Math.min(start + size, total)
        const chunk = selectedPubkeys.slice(start, end)
        const data  = concat([...chunk, target])
        return {
          to:    contract,
          data,
          value: toHex(parseEther('0.01')),
        }
      })

      const batchRequest = {
        version: '1.0',
        chainId: chainId,
        from: address,
        calls,
      }

      const provider = (window as any).ethereum
      if (!provider?.request) {
        throw new Error('No injected provider found')
      }

      const batchId = await provider.request({
        method: 'wallet_sendCalls',
        params: [batchRequest],
      })

      console.log('Batch sent, id:', batchId)
      return batchId
    },
    [address, chainId, contract]
  )

  return { consolidateValidators }
}