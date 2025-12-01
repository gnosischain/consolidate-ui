import { ValidatorInfo } from "../types/validators";

/**
 * Computes partial deposit amounts for validators
 * @param amount - Total amount to distribute
 * @param validators - Array of validator information
 * @param targetAmount - Target balance for validators (0 for equal distribution)
 * @returns Array of amounts to deposit to each validator
 */
export function computePartialDepositAmounts(
  amount: bigint,
  validators: ValidatorInfo[],
  targetAmount: bigint
): bigint[] {
  const amounts: bigint[] = [];

  if (targetAmount === 0n) {
    // Equal distribution
    const baseAmount = amount / BigInt(validators.length);
    const remainder = amount % BigInt(validators.length);
    validators.forEach((_, i) => {
      amounts.push(baseAmount + (i < Number(remainder) ? 1n : 0n));
    });
  } else {
    // Distribution based on need to reach target
    const needed = validators.map(v =>
      v.balance < targetAmount ? targetAmount - v.balance : 0n
    );

    const totalNeeded = needed.reduce((sum, n) => sum + n, 0n);

    if (totalNeeded > amount) {
      // Proportional distribution if not enough to fill all
      needed.forEach((need) => {
        if (need > 0n) {
          amounts.push((need * amount) / totalNeeded);
        } else {
          amounts.push(0n);
        }
      });
    } else {
      // Exact amounts needed
      amounts.push(...needed);
    }
  }

  return amounts;
}

