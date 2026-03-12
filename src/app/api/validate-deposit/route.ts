import { NextRequest, NextResponse } from 'next/server';
import { validateDepositData } from '../../../utils/depositValidation';

export const GRAPHQL_URL = process.env.GRAPHQL_URL;

if (!GRAPHQL_URL) {
    throw new Error('GRAPHQL_URL is not defined');
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { depositDataJson, balance, contractConfig } = body;

        if (!depositDataJson || balance === undefined || !contractConfig) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const result = await validateDepositData(
            depositDataJson,
            BigInt(balance),
            contractConfig,
            GRAPHQL_URL!
        );

        return NextResponse.json({
            data: {
                deposits: result.deposits,
                credentialType: result.credentialType,
                totalDepositAmount: result.totalDepositAmount.toString(),
            }
        });
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : 'Validation failed';
        return NextResponse.json({ error: errMessage }, { status: 400 });
    }
}