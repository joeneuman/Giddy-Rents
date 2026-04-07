"use server";

import { db } from "@/lib/db";
import { getCurrentTrustBalance, calculateFee, recalculateBalances } from "@/lib/trust";
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

  await db.trustTransaction.create({
    data: {
      type: "deposit",
      amount: payment.amount,
      balance: 0,
      date: payment.datePaid,
      description: `Rent payment — ${payment.lease.property.name}`,
      paymentId: payment.id,
      leaseId: payment.leaseId,
      ownerId: payment.lease.property.ownerId,
      tenantId: payment.tenantId,
    },
  });

  await recalculateBalances();
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

  const fee = calculateFee(lease.property.feeType, lease.property.feeAmount, data.amount);
  const netPayout = data.amount - fee;

  const currentBalance = await getCurrentTrustBalance();
  if (netPayout + fee > currentBalance) {
    return { error: "Insufficient trust account balance" };
  }

  const date = new Date(data.date);

  await db.trustTransaction.create({
    data: {
      type: "owner_payout",
      amount: -netPayout,
      balance: 0,
      date,
      description: `Payout to ${owner.firstName} ${owner.lastName} — ${lease.property.name}`,
      notes: data.notes || null,
      leaseId: data.leaseId,
      ownerId: data.ownerId,
      tenantId: lease.tenantId,
    },
  });

  if (fee > 0) {
    await db.trustTransaction.create({
      data: {
        type: "company_fee",
        amount: -fee,
        balance: 0,
        date,
        description: `Management fee — ${lease.property.name} (${lease.property.feeType === "percentage" ? `${lease.property.feeAmount}%` : `$${lease.property.feeAmount} flat`})`,
        leaseId: data.leaseId,
        ownerId: data.ownerId,
      },
    });
  }

  await recalculateBalances();
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
  const amount = isRefund ? -data.amount : data.amount;

  if (isRefund) {
    const currentBalance = await getCurrentTrustBalance();
    if (currentBalance + amount < 0) {
      return { error: "Insufficient trust account balance for refund" };
    }
  }

  const lease = await db.lease.findUnique({
    where: { id: data.leaseId },
    include: { property: true, tenant: true },
  });
  if (!lease) return { error: "Lease not found" };

  await db.trustTransaction.create({
    data: {
      type: isRefund ? "security_deposit_refund" : "security_deposit_in",
      amount,
      balance: 0,
      date: new Date(data.date),
      description: `Security deposit ${isRefund ? "refund" : "received"} — ${lease.property.name} (${lease.tenant.firstName} ${lease.tenant.lastName})`,
      notes: data.notes || null,
      leaseId: data.leaseId,
      tenantId: data.tenantId,
    },
  });

  await recalculateBalances();
  revalidatePath("/trust");
  redirect("/trust");
}

export async function createOwnerDeposit(formData: FormData) {
  const ownerId = formData.get("ownerId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const notes = formData.get("notes") as string;
  const propertyId = formData.get("propertyId") as string;

  if (!ownerId || !amount || !date) {
    return { error: "Owner, amount, and date are required" };
  }

  const owner = await db.owner.findUnique({ where: { id: ownerId } });
  if (!owner) return { error: "Owner not found" };

  let propertyName = "";
  if (propertyId && propertyId !== "none") {
    const property = await db.property.findUnique({ where: { id: propertyId } });
    propertyName = property ? ` — ${property.name}` : "";
  }

  await db.trustTransaction.create({
    data: {
      type: "owner_deposit",
      amount,
      balance: 0,
      date: new Date(date),
      description: `Owner deposit from ${owner.firstName} ${owner.lastName}${propertyName}`,
      notes: notes || null,
      ownerId,
    },
  });

  await recalculateBalances();
  revalidatePath("/trust");
  redirect("/trust");
}

export async function payOwnerFromCycle(formData: FormData) {
  const ownerId = formData.get("ownerId") as string;
  const leaseId = formData.get("leaseId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;

  if (!ownerId || !leaseId || !amount || !date) {
    return { error: "Missing required fields" };
  }

  const owner = await db.owner.findUnique({ where: { id: ownerId } });
  if (!owner) return { error: "Owner not found" };

  const lease = await db.lease.findUnique({
    where: { id: leaseId },
    include: { property: true, tenant: true },
  });
  if (!lease) return { error: "Lease not found" };

  const fee = calculateFee(lease.property.feeType, lease.property.feeAmount, amount);
  const netPayout = amount - fee;

  const currentBalance = await getCurrentTrustBalance();
  if (netPayout + fee > currentBalance) {
    return { error: "Insufficient trust account balance" };
  }

  const payDate = new Date(date);

  await db.trustTransaction.create({
    data: {
      type: "owner_payout",
      amount: -netPayout,
      balance: 0,
      date: payDate,
      description: `Payout to ${owner.firstName} ${owner.lastName} — ${lease.property.name}`,
      leaseId,
      ownerId,
      tenantId: lease.tenantId,
    },
  });

  if (fee > 0) {
    await db.trustTransaction.create({
      data: {
        type: "company_fee",
        amount: -fee,
        balance: 0,
        date: payDate,
        description: `Management fee — ${lease.property.name} (${lease.property.feeType === "percentage" ? `${lease.property.feeAmount}%` : `$${lease.property.feeAmount} flat`})`,
        leaseId,
        ownerId,
      },
    });
  }

  await recalculateBalances();
  revalidatePath("/rent-collection");
  redirect("/rent-collection");
}

export async function transferToOperating(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;

  if (!amount || !date) {
    return { error: "Amount and date are required" };
  }

  const currentBalance = await getCurrentTrustBalance();
  if (amount > currentBalance) {
    return { error: "Insufficient trust account balance" };
  }

  await db.trustTransaction.create({
    data: {
      type: "company_transfer",
      amount: -amount,
      balance: 0,
      date: new Date(date),
      description: `Transfer to operating account`,
    },
  });

  await recalculateBalances();
  revalidatePath("/rent-collection");
  redirect("/rent-collection");
}

export async function deleteTrustTransaction(id: string) {
  await db.trustTransaction.delete({ where: { id } });
  await recalculateBalances();
  revalidatePath("/trust");
  redirect("/trust");
}
