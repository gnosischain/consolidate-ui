import { mainnet, gnosis, gnosisChiado, sepolia } from 'wagmi/chains';
import { NetworkConfig } from '../types/network';

const QUICKNODE_ENDPOINT = process.env.NEXT_PUBLIC_QUICKNODE_ENDPOINT;
const QUICKNODE_TOKEN = process.env.NEXT_PUBLIC_QUICKNODE_TOKEN;

const GNOSIS_CL = {
	minBalance: 1,
	maxBalance: 64,
	multiplier: 32n,
};

const ETHEREUM_CL = {
	minBalance: 32,
	maxBalance: 2048,
	multiplier: 1n,
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
		forkVersion: "00000000",
	},
	[sepolia.id]: {
		explorerUrl: sepolia.blockExplorers.default.url,
		consolidateAddress: '0x0000BBdDc7CE488642fb579F8B00f3a590007251',
		withdrawalAddress: '0x00000961Ef480Eb55e80D19ad83579A64c007002',
		clEndpoint:
			'https://' + QUICKNODE_ENDPOINT + '.ethereum-sepolia.quiknode.pro/' + QUICKNODE_TOKEN,
		chainId: sepolia.id,
		cl: ETHEREUM_CL,
		forkVersion: "90000069",
	},
	[gnosis.id]: {
		explorerUrl: gnosis.blockExplorers.default.url,
		consolidateAddress: '0x0000BBdDc7CE488642fb579F8B00f3a590007251',
		withdrawalAddress: '0x00000961Ef480Eb55e80D19ad83579A64c007002',
		tokenAddress: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
		depositAddress: "0x0B98057eA310F4d31F2a452B414647007d1645d9",
		claimRegistryAddress: "0xC40Afe50EfB8D18f596211a4AF53fe142CA5DE04",
		payClaimActionAddress: "0x8530D4D6E187861335555B9827400248AB0a07F8",
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
		depositAddress: "0xb97036A26259B7147018913bD58a774cf91acf25",
		clEndpoint: 'https://rpc-gbc.chiadochain.net',
		chainId: gnosisChiado.id,
		forkVersion: "0000006f",
		cl: GNOSIS_CL,
	},
};
