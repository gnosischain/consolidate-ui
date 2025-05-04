import { http, createConfig } from 'wagmi';
import { mainnet, gnosis, gnosisChiado, sepolia } from 'wagmi/chains';

export const config = createConfig({
	chains: [mainnet, gnosis, gnosisChiado, sepolia],
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
		[gnosis.id]: http('https://rpc.gnosischain.com/'),
		[gnosisChiado.id]: http('https://rpc.chiadochain.net'),
	},
});
