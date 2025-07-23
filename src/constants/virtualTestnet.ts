import { defineChain } from 'viem'
 
export const virtualTestnet = defineChain({
  id: 100,
  name: 'Gnosis',
  nativeCurrency: {
    decimals: 18,
    name: 'xDAI',
    symbol: 'XDAI',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_VIRTUAL_TESTNET_RPC_HTTP!],
      webSocket: [process.env.NEXT_PUBLIC_VIRTUAL_TESTNET_RPC_WSS!],
    },
  },
  blockExplorers: {
    default: { name: 'Gnosisscan', url: 'https://gnosisscan.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 21022491,
    },
  },
})