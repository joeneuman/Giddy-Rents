"use server";

import { db } from "@/lib/db";
import { getCurrentTrustBalance, calculateFee } from "@/lib/trust";
import { ownerPayoutSchema, securityDepositSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTrustDeposit(paymentId: string) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      lease: { include: { property: true } },
      tenant: true,
    },
  });

  if (!payment) return;

  const currentBalance = await getCurrentTrustBalance();
  const newBalance = currentBalance + payment.amount;

  await db.trustTransaction.create({
    data: {
      type: "deposit",
      amount: payment.amount,
      balance: newBalance,
      date: payment.datePaid,
      description: `Rent payment — ${payment.lease.property.name}`,
      paymentId: payment.id,
      leaseId: payment.leaseId,
      ownerId: payment.lease.property.ownerId,
      tenantId: payment.tenantId,
    },
  });
}

export async function createOwnerPayout(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = ownerPayoutSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const owner = await db.owner.findUnique({ where: { id: data.ownerId } });
  if (!owner) return { error: "Owner not found" };

  const lease = await db.lease.findUnique({
    where: { id: data.leaseId },
    include: { property: true, tenant: true },
  });
  if (!lease) return { error: "Lease not found" };

  const fee = calculateFee(owner.feeType, owner.feeAmount, data.amount);
  const netPayout = data.amount - fee;

  const currentBalance = await getCurrentTrustBalance();

  if (netPayout + fee > currentBalance) {
    return { error: "Insufficient trust account balance" };
  }

  const date = new Date(data.date);

  // Owner payout (negative — money leaving trust)
  const afterPayout = currentBalance - netPayout;
  await db.trustTransaction.create({
    data: {
      type: "owner_payout",
      amount: -netPayout,
      balance: afterPayout,
      date,
      description: `Payout to ${owner.firstName} ${owner.lastName} — ${lease.property.name}`,
      notes: data.notes || null,
      leaseId: data.leaseId,
      ownerId: data.ownerId,
      tenantId: lease.tenantId,
    },
  });

  // Company fee (negative — money leaving trust to operating)
  if (fee > 0) {
    const afterFee = afterPayout - fee;
    await db.trustTransaction.create({
      data: {
        type: "company_fee",
        amount: -fee,
        balance: afterFee,
        date,
        description: `Management fee — ${lease.property.name} (${owner.feeType === "percentage" ? `${owner.feeAmount}%` : `$${owner.feeAmount} flat`})`,
        leaseId: data.leaseId,
        ownerId: data.ownerId,
      },
    });
  }

  revalidatePath("/trust");
  redirect("/trust");
}

export async function createSecurityDeposit(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = securityDepositSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const isRefund = data.type === "refund";

  const lease = await db.lease.findUnique({
    where: { id: data.leaseId },
    include: { property: true, tenant: true },
  });
  if (!lease) return { error: "Lease not found" };

  const currentBalance = await getCurrentTrustBalance();
  const amount = isRefund ? -data.amount : data.amount;
  const newBalance = currentBalance + amount;

  if (isRefund && newBalance < 0) {
    return { error: "Insufficient trust account balance for refund" };
  }

  await db.trustTransaction.create({
    data: {
      type: isRefund ? "security_deposit_refund" : "security_deposit_in",
      amount,
      balance: newBalance,
      date: new Date(data.date),
      description: `Security deposit ${isRefund ? "refund" : "received"} — ${lease.property.name} (${lease.tenant.firstName} ${lease.tenant.lastName})`,
      notes: data.notes || null,
      leaseId: data.leaseId,
      tenantId: data.tenantId,
    },
  });

  revalidatePath("/trust");
  redirect("/trust");
}
