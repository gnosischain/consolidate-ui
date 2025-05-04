import { Address } from 'viem';
import { mainnet, gnosis, gnosisChiado, sepolia } from 'wagmi/chains';

export interface NetworkConfig {
	explorerUrl: string;
	consolidateAddress: Address;
	beaconchainApi?: string;
	clEndpoint: string;
	chainId: number;
	cl: {
		minBalance: number;
		maxBalance: number;
		multiplier: number;
	};
}

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
		beaconchainApi: 'https://beaconcha.in',
		clEndpoint: 'https://' + QUICKNODE_ENDPOINT + '.quiknode.pro/' + QUICKNODE_TOKEN,
		chainId: mainnet.id,
		cl: ETHEREUM_CL,
	},
	[sepolia.id]: {
		explorerUrl: sepolia.blockExplorers.default.url,
		consolidateAddress: '0x0000BBdDc7CE488642fb579F8B00f3a590007251',
		clEndpoint:
			'https://' + QUICKNODE_ENDPOINT + '.ethereum-sepolia.quiknode.pro/' + QUICKNODE_TOKEN,
		chainId: sepolia.id,
		cl: ETHEREUM_CL,
	},
	[gnosis.id]: {
		explorerUrl: gnosis.blockExplorers.default.url,
		consolidateAddress: '0x0000BBdDc7CE488642fb579F8B00f3a590007251',
		clEndpoint: 'https://rpc-gbc.gnosischain.com',
		beaconchainApi: 'https://gnosischa.in',
		chainId: gnosis.id,
		cl: GNOSIS_CL,
	},
	[gnosisChiado.id]: {
		explorerUrl: gnosisChiado.blockExplorers.default.url,
		consolidateAddress: '0x0000BBdDc7CE488642fb579F8B00f3a590007251',
		clEndpoint: 'https://rpc-gbc.chiadochain.net',
		chainId: gnosisChiado.id,
		cl: GNOSIS_CL,
	},
};
