import { http, createConfig } from 'wagmi';
import { gnosis, gnosisChiado } from 'wagmi/chains';
import { safe } from 'wagmi/connectors';

export const config = createConfig({
	chains: [gnosis, gnosisChiado],
	connectors: [safe()],
	transports: {
		// [mainnet.id]: http(),
		// [sepolia.id]: http(),
		[gnosis.id]: http('https://rpc.gnosischain.com/'),
		[gnosisChiado.id]: http('https://rpc.chiadochain.net'),
	},
});
