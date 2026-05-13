import { NextRequest, NextResponse } from 'next/server';
import { validateDepositData } from '../../../utils/depositValidation';
import { NETWORK_CONFIG } from '../../../constants/networks';

const GRAPHQL_URL = process.env.GRAPHQL_URL;

if (!GRAPHQL_URL) {
	console.error(
		'[validate-deposit] GRAPHQL_URL is not set — /api/validate-deposit will return 500 until this env var is configured.',
	);
}

export async function POST(request: NextRequest) {
	try {
		if (!GRAPHQL_URL) {
			console.error('[validate-deposit] Refusing request: GRAPHQL_URL is missing');
			return NextResponse.json(
				{ error: 'GRAPHQL_URL is not configured on the server.' },
				{ status: 500 },
			);
		}

		const body = await request.json();
		const { depositDataJson, balance, chainId } = body;

		if (!depositDataJson || balance === undefined || !chainId) {
			return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
		}

		const contractConfig = NETWORK_CONFIG[Number(chainId)];

		if (!contractConfig) {
			return NextResponse.json({ error: 'Invalid chain ID' }, { status: 400 });
		}

		const result = await validateDepositData(
			depositDataJson,
			BigInt(balance),
			contractConfig,
			GRAPHQL_URL,
		);

		return NextResponse.json({
			data: {
				deposits: result.deposits,
				credentialType: result.credentialType,
				totalDepositAmount: result.totalDepositAmount.toString(),
			},
		});
	} catch (error) {
		const errMessage = error instanceof Error ? error.message : 'Validation failed';
		return NextResponse.json({ error: errMessage }, { status: 400 });
	}
}
