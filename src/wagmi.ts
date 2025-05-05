import { safe } from '@wagmi/connectors';
import { http, createConfig } from 'wagmi';
import { mainnet, gnosis, gnosisChiado, sepolia } from 'wagmi/chains';

export const config = createConfig({
	chains: [mainnet, gnosis, gnosisChiado, sepolia],
	connectors: [safe()],
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
		[gnosis.id]: http('https://rpc.gnosischain.com/'),
		[gnosisChiado.id]: http('https://rpc.chiadochain.net'),
	},
});
