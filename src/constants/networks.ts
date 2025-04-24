import { Address } from 'viem'
import { mainnet, gnosis, gnosisChiado, holesky } from 'wagmi/chains'

export interface NetworkConfig {
  explorerUrl: string
  consolidateAddress: Address
}

export const NETWORK_CONFIG: Record<number, NetworkConfig> = {
  [mainnet.id]: {
    explorerUrl: mainnet.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
  },
  [holesky.id]: {
    explorerUrl: holesky.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
  },
  [gnosis.id]: {
    explorerUrl: gnosis.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
  },
  [gnosisChiado.id]: {
    explorerUrl: gnosisChiado.blockExplorers.default.url,
    consolidateAddress: "0x0000BBdDc7CE488642fb579F8B00f3a590007251",
  },
}
