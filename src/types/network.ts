import { Address } from "viem";

export interface NetworkConfig {
	explorerUrl: string;
	consolidateAddress: Address;
	withdrawalAddress: Address;
    tokenAddress?: Address;
    depositAddress?: Address;
    claimRegistryAddress?: Address;
    dappnodeIncentiveAddress?: Address;
	beaconchainApi?: string;
	clEndpoint: string;
	chainId: number;
	cl: {
		minBalance: number;
		maxBalance: number;
		multiplier: number;
	};
}