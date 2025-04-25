import { Address } from 'viem';
import { mainnet, gnosis, gnosisChiado, sepolia } from 'wagmi/chains';

export interface NetworkConfig {
  explorerUrl: string
  consolidateAddress: Address
  beaconExplorerUrl: string
}

const QUICKNODE_ENDPOINT = import.meta.env.VITE_QUICKNODE_ENDPOINT;
const QUICKNODE_TOKEN = import.meta.env.VITE_QUICKNODE_TOKEN;

export const NETWORK_CONFIG: Record<number, NetworkConfig> = {
  [mainnet.id]: {
    explorerUrl: mainnet.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
    beaconExplorerUrl: "https://" + QUICKNODE_ENDPOINT + ".quiknode.pro/" + QUICKNODE_TOKEN + "/eth/v1/beacon/states/head/validators",
  },
  [sepolia.id]: {
    explorerUrl: sepolia.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
    beaconExplorerUrl: "https://" + QUICKNODE_ENDPOINT + ".ethereum-sepolia.quiknode.pro/" + QUICKNODE_TOKEN + "/eth/v1/beacon/states/head/validators",
  },
  [gnosis.id]: {
    explorerUrl: gnosis.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
    beaconExplorerUrl: 'https://gnosischa.in',
  },
  [gnosisChiado.id]: {
    explorerUrl: gnosisChiado.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
    beaconExplorerUrl: 'https://rpc-gbc.chiadochain.net/eth/v1/beacon/states/finalized/validators',
  },
}
