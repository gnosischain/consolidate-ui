import { Address } from 'viem';

export interface TransactionCall {
	to: Address;
	data: `0x${string}`;
	value?: bigint;
	title?: string;
}
