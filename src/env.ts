import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Typed, validated environment variables.
 *
 * Required vars are validated at startup (fail-fast). Optional vars degrade
 * gracefully at the call site. Validation is skipped when SKIP_ENV_VALIDATION
 * is set (used by CI builds, which run without real secrets).
 */
export const env = createEnv({
	server: {
		// Optional: /api/validate-deposit handles a missing value gracefully.
		GRAPHQL_URL: z.string().min(1).optional(),
		// Required: /api/validators-by-address cannot function without these.
		CHIADO_VALIDATORS_API_URL: z.string().min(1),
		CHIADO_VALIDATORS_API_KEY: z.string().min(1),
		GNOSIS_VALIDATORS_API_URL: z.string().min(1),
		GNOSIS_VALIDATORS_API_KEY: z.string().min(1),
	},
	client: {
		// Optional: only used to build the Ethereum mainnet/Sepolia RPC URLs.
		NEXT_PUBLIC_QUICKNODE_ENDPOINT: z.string().min(1).optional(),
		NEXT_PUBLIC_QUICKNODE_TOKEN: z.string().min(1).optional(),
	},
	runtimeEnv: {
		GRAPHQL_URL: process.env.GRAPHQL_URL,
		CHIADO_VALIDATORS_API_URL: process.env.CHIADO_VALIDATORS_API_URL,
		CHIADO_VALIDATORS_API_KEY: process.env.CHIADO_VALIDATORS_API_KEY,
		GNOSIS_VALIDATORS_API_URL: process.env.GNOSIS_VALIDATORS_API_URL,
		GNOSIS_VALIDATORS_API_KEY: process.env.GNOSIS_VALIDATORS_API_KEY,
		NEXT_PUBLIC_QUICKNODE_ENDPOINT: process.env.NEXT_PUBLIC_QUICKNODE_ENDPOINT,
		NEXT_PUBLIC_QUICKNODE_TOKEN: process.env.NEXT_PUBLIC_QUICKNODE_TOKEN,
	},
	emptyStringAsUndefined: true,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
