import { db } from "@/lib/db";

export async function getCurrentTrustBalance(): Promise<number> {
  const latest = await db.trustTransaction.findFirst({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  return latest?.balance ?? 0;
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
  const deposits = await db.trustTransaction.aggregate({
    _sum: { amount: true },
    where: {
      ownerId,
      type: { in: ["deposit", "owner_payout", "company_fee"] },
    },
  });
  return deposits._sum.amount ?? 0;
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
