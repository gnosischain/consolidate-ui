import { Address } from 'viem'
import { mainnet, gnosis, gnosisChiado, holesky } from 'wagmi/chains'

export interface NetworkConfig {
  explorerUrl: string
  consolidateAddress: Address
  beaconExplorerUrl?: string
}

export const NETWORK_CONFIG: Record<number, NetworkConfig> = {
  [mainnet.id]: {
    explorerUrl: mainnet.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
    beaconExplorerUrl: "https://beaconcha.in/api/v1/validator/eth1/",
  },
  [holesky.id]: {
    explorerUrl: holesky.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
    beaconExplorerUrl: "https://beaconcha.in/api/v1/validator/eth1/",
  },
  [gnosis.id]: {
    explorerUrl: gnosis.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
    beaconExplorerUrl: 'https://gnosischa.in',
  },
  [gnosisChiado.id]: {
    explorerUrl: gnosisChiado.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
    beaconExplorerUrl: 'https://beacon.chiadochain.net',
  },
}
