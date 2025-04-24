import { http, createConfig } from 'wagmi'
import { mainnet, gnosis, gnosisChiado, holesky } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, holesky, gnosis, gnosisChiado],
  transports: {
    [mainnet.id]: http(),
    [holesky.id]: http(),
    [gnosis.id]: http("https://rpc.gnosischain.com/"),
    [gnosisChiado.id]: http("https://rpc.chiadochain.net"),
  },
})