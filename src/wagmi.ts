import { http, createConfig, mock } from 'wagmi';
import { gnosis, gnosisChiado } from 'wagmi/chains';
import { safe } from 'wagmi/connectors';

export const isTestEnv = process.env.NEXT_PUBLIC_E2E_TEST === 'true';

console.log('isTestEnv', isTestEnv, process.env.NEXT_PUBLIC_E2E_TEST);

export const config = createConfig({
	chains: [gnosis, gnosisChiado],
	connectors: [safe(), ...(isTestEnv ? [mock({
		accounts: ['0xd9a43e13258C57a8407aE0DAf6033C12EeDF2aF9'
		]
	})] : [])],
	transports: {
		// [mainnet.id]: http(),
		// [sepolia.id]: http(),
		[gnosis.id]: http('https://rpc.gnosischain.com/'),
		[gnosisChiado.id]: http('https://rpc.chiadochain.net'),
	},
});
