import { gnosis, gnosisChiado } from 'wagmi/chains';
import { NetworkConfig } from '../types/network';

const GNOSIS_CL = {
	minBalance: 1,
	maxBalance: 64,
	multiplier: 32n,
};

/** Supported chains only; avoids bundling unused NEXT_PUBLIC RPC secrets for ETH/Sepolia. */
export const NETWORK_CONFIG: Record<number, NetworkConfig> = {
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
		beaconchainApi: 'https://beaconchain.gnosischain.com/',
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
