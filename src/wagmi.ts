import { createWalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { http, createConfig, mock } from 'wagmi';
import { gnosis, gnosisChiado } from 'wagmi/chains';
import { safe } from 'wagmi/connectors';
import { virtualTestnet } from './constants/virtualTestnet';

export const isTestEnv = process.env.NEXT_PUBLIC_E2E_TEST === 'true'
const TEST_RPC = process.env.NEXT_PUBLIC_VIRTUAL_TESTNET_RPC_HTTP!
const TEST_KEY = process.env.NEXT_PUBLIC_TEST_PRIVATE_KEY!

export const testAccount = isTestEnv
	? privateKeyToAccount(TEST_KEY as `0x${string}`)
	: undefined;

export const walletClient = isTestEnv
	? createWalletClient({
		account: testAccount,
		chain: virtualTestnet,
		transport: http(TEST_RPC),
	})
	: undefined

export const config = createConfig({
	chains: [gnosis, gnosisChiado],
	connectors: [safe(), ...(isTestEnv ? [mock({
		accounts: [testAccount?.address as `0x${string}`]
	})] : [])],
	transports: {
		// [mainnet.id]: http(),
		// [sepolia.id]: http(),
		[gnosis.id]: http(isTestEnv ? TEST_RPC : 'https://rpc.gnosischain.com/'),
		[gnosisChiado.id]: http('https://rpc.chiadochain.net'),
	},
});
