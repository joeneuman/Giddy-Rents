import { db } from "@/lib/db";

export async function getCurrentTrustBalance(userId: string): Promise<number> {
  const result = await db.trustTransaction.aggregate({
    _sum: { amount: true },
    where: { userId },
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

export async function getOwnerTrustBalance(userId: string, ownerId: string): Promise<number> {
  const result = await db.trustTransaction.aggregate({
    _sum: { amount: true },
    where: {
      userId,
      ownerId,
      type: { in: ["owner_deposit", "owner_payout", "company_fee"] },
    },
  });
  return result._sum.amount ?? 0;
}

export async function recalculateBalances(userId: string): Promise<void> {
  const transactions = await db.trustTransaction.findMany({
    where: { userId },
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

export async function getSecurityDepositBalance(userId: string, tenantId: string): Promise<number> {
  const result = await db.trustTransaction.aggregate({
    _sum: { amount: true },
    where: {
      userId,
      tenantId,
      type: { in: ["security_deposit_in", "security_deposit_refund"] },
    },
  });
  return result._sum.amount ?? 0;
}
