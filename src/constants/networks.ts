import { mainnet, gnosis, gnosisChiado, sepolia } from 'wagmi/chains';
import { NetworkConfig } from '../types/network';

const QUICKNODE_ENDPOINT = import.meta.env.VITE_QUICKNODE_ENDPOINT;
const QUICKNODE_TOKEN = import.meta.env.VITE_QUICKNODE_TOKEN;

const GNOSIS_CL = {
	minBalance: 1,
	maxBalance: 64,
	multiplier: 32,
};

const ETHEREUM_CL = {
	minBalance: 32,
	maxBalance: 2048,
	multiplier: 1,
};

export const NETWORK_CONFIG: Record<number, NetworkConfig> = {
	[mainnet.id]: {
		explorerUrl: mainnet.blockExplorers.default.url,
		consolidateAddress: '0x0000BBdDc7CE488642fb579F8B00f3a590007251',
		withdrawalAddress: '0x00000961Ef480Eb55e80D19ad83579A64c007002',
		beaconchainApi: 'https://beaconcha.in',
		clEndpoint: 'https://' + QUICKNODE_ENDPOINT + '.quiknode.pro/' + QUICKNODE_TOKEN,
		chainId: mainnet.id,
		cl: ETHEREUM_CL,
		forkVersion: "0x00000000",
	},
	[sepolia.id]: {
		explorerUrl: sepolia.blockExplorers.default.url,
		consolidateAddress: '0x0000BBdDc7CE488642fb579F8B00f3a590007251',
		withdrawalAddress: '0x00000961Ef480Eb55e80D19ad83579A64c007002',
		clEndpoint:
			'https://' + QUICKNODE_ENDPOINT + '.ethereum-sepolia.quiknode.pro/' + QUICKNODE_TOKEN,
		chainId: sepolia.id,
		cl: ETHEREUM_CL,
		forkVersion: "0x90000069",
	},
	[gnosis.id]: {
		explorerUrl: gnosis.blockExplorers.default.url,
		consolidateAddress: '0x0000BBdDc7CE488642fb579F8B00f3a590007251',
		withdrawalAddress: '0x00000961Ef480Eb55e80D19ad83579A64c007002',
		tokenAddress: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
		depositAddress: "0x0B98057eA310F4d31F2a452B414647007d1645d9",
		claimRegistryAddress: "0xe4d0a119cc2546c1ec4945c04b04985d1e59cdba",
		dappnodeIncentiveAddress: "0x485c6Be503D32511c1282b68dD99E85f250572c3",
		clEndpoint: 'https://rpc-gbc.gnosischain.com',
		beaconchainApi: 'https://gnosischa.in',
		chainId: gnosis.id,
		forkVersion: "00000064",
		cl: GNOSIS_CL,
	},
	[gnosisChiado.id]: {
		explorerUrl: gnosisChiado.blockExplorers.default.url,
		consolidateAddress: '0x0000BBdDc7CE488642fb579F8B00f3a590007251',
		withdrawalAddress: '0x00000961Ef480Eb55e80D19ad83579A64c007002',		
		tokenAddress: "0x19C653Da7c37c66208fbfbE8908A5051B57b4C70",
		depositAddress: "0x49dE1aced385334F1a66d86Db363264eB5b6A708",
		claimRegistryAddress: "0x28f1ba1f2Db9Aa0ca4b3B7cD9Ae327f6E872867D",
		clEndpoint: 'https://rpc-gbc.chiadochain.net',
		chainId: gnosisChiado.id,
		forkVersion: "0000006f",
		cl: GNOSIS_CL,
	},
};
