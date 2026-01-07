import { NextRequest, NextResponse } from 'next/server';
import { parseGwei } from 'viem';
import { PendingPartialWithdrawal, PendingDeposit, PendingConsolidation } from '../../../types/beacon';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clEndpoint = searchParams.get('clEndpoint');
    const clMultiplier = searchParams.get('clMultiplier') || '1';
    const stateId = searchParams.get('stateId') || 'finalized';

    if (!clEndpoint) {
      return NextResponse.json({ error: 'clEndpoint parameter is required' }, { status: 400 });
    }

    const multiplier = BigInt(clMultiplier);

    const [withdrawalsRes, depositsRes, consolidationsRes] = await Promise.all([
      fetch(`${clEndpoint}/eth/v1/beacon/states/${stateId}/pending_partial_withdrawals`),
      fetch(`${clEndpoint}/eth/v1/beacon/states/${stateId}/pending_deposits`),
      fetch(`${clEndpoint}/eth/v1/beacon/states/${stateId}/pending_consolidations`),
    ]);

    let pendingWithdrawals: PendingPartialWithdrawal[] = [];
    let pendingDeposits: PendingDeposit[] = [];
    let pendingConsolidations: PendingConsolidation[] = [];

    if (withdrawalsRes.ok) {
      const json = await withdrawalsRes.json();
      pendingWithdrawals = (json.data || []).map((w: PendingPartialWithdrawal) => ({
        ...w,
        validator_index: Number(w.validator_index),
        amount: (parseGwei(w.amount) / multiplier).toString(),
      }));
    }

    if (depositsRes.ok) {
      const json = await depositsRes.json();
      pendingDeposits = (json.data || []).map((d: PendingDeposit) => ({
        ...d,
        amount: (parseGwei(d.amount) / multiplier).toString(),
      }));
    }

    if (consolidationsRes.ok) {
      const json = await consolidationsRes.json();
      pendingConsolidations = (json.data || []).map((c: PendingConsolidation) => ({
        source_index: Number(c.source_index),
        target_index: Number(c.target_index),
      }));
    }

    return NextResponse.json({
      data: {
        pendingWithdrawals,
        pendingDeposits,
        pendingConsolidations,
      },
    });
  } catch (error) {
    console.error('Error fetching pending states:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

