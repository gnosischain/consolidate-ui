import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, gnosis, gnosisChiado } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, sepolia, gnosis, gnosisChiado],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [gnosis.id]: http("https://rpc.gnosischain.com/"),
    [gnosisChiado.id]: http("https://rpc.chiadochain.net"),
  },
})