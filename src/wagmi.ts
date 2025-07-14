import { http, createConfig, mock } from 'wagmi';
import { gnosis, gnosisChiado } from 'wagmi/chains';
import { safe } from 'wagmi/connectors';

export const isTestEnv = process.env.NEXT_PUBLIC_E2E_TEST === 'true';

console.log('isTestEnv', isTestEnv, process.env.NEXT_PUBLIC_E2E_TEST);

export const config = createConfig({
	chains: [gnosis, gnosisChiado],
	connectors: [safe(), ...(isTestEnv ? [mock({
		accounts: ['0x97D2eEb65DA0c37dc0F43FF4691E521673eFADfd'
		]
	})] : [])],
	transports: {
		// [mainnet.id]: http(),
		// [sepolia.id]: http(),
		[gnosis.id]: http('https://rpc.gnosischain.com/'),
		[gnosisChiado.id]: http('https://rpc.chiadochain.net'),
	},
});
