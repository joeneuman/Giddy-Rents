import { db } from "@/lib/db";

export async function getCurrentTrustBalance(): Promise<number> {
  // Sum all amounts — this is always accurate regardless of ordering
  const result = await db.trustTransaction.aggregate({
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export function calculateFee(
  feeType: string | null,
  feeAmount: number | null,
  rentAmount: number
): number {
  if (!feeType || feeAmount == null) return 0;
  if (feeType === "flat") return feeAmount;
  if (feeType === "percentage") return Math.round(rentAmount * feeAmount) / 100;
  return 0;
}

export async function getOwnerTrustBalance(ownerId: string): Promise<number> {
  const result = await db.trustTransaction.aggregate({
    _sum: { amount: true },
    where: {
      ownerId,
      type: { in: ["owner_deposit", "owner_payout", "company_fee"] },
    },
  });
  return result._sum.amount ?? 0;
}

export async function recalculateBalances(): Promise<void> {
  const transactions = await db.trustTransaction.findMany({
    orderBy: [{ date: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });

  let balance = 0;
  for (const tx of transactions) {
    balance += tx.amount;
    if (Math.abs(tx.balance - balance) > 0.001) {
      await db.trustTransaction.update({
        where: { id: tx.id },
        data: { balance },
      });
    }
  }
}

export async function getSecurityDepositBalance(tenantId: string): Promise<number> {
  const result = await db.trustTransaction.aggregate({
    _sum: { amount: true },
    where: {
      tenantId,
      type: { in: ["security_deposit_in", "security_deposit_refund"] },
    },
  });
  return result._sum.amount ?? 0;
}
