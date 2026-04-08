"use server";

import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { paymentSchema } from "@/lib/validations";
import { createTrustDeposit } from "@/actions/trust";
import { recalculateBalances } from "@/lib/trust";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPayment(formData: FormData) {
  const userId = await getUserId();
  const raw = Object.fromEntries(formData);
  const parsed = paymentSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const payment = await db.payment.create({
    data: {
      userId,
      leaseId: data.leaseId,
      tenantId: data.tenantId,
      amount: data.amount,
      datePaid: new Date(data.datePaid),
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
      method: data.method,
      referenceNumber: data.referenceNumber || null,
      notes: data.notes || null,
    },
  });

  try {
    await createTrustDeposit(payment.id);
  } catch (e) {
    console.error("Failed to create trust deposit:", e);
  }

  redirect(`/payments/${payment.id}`);
}

export async function createPaymentFromCollection(formData: FormData) {
  const userId = await getUserId();
  const raw = Object.fromEntries(formData);
  const parsed = paymentSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const payment = await db.payment.create({
    data: {
      userId,
      leaseId: data.leaseId,
      tenantId: data.tenantId,
      amount: data.amount,
      datePaid: new Date(data.datePaid),
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
      method: data.method,
      referenceNumber: data.referenceNumber || null,
      notes: data.notes || null,
    },
  });

  try {
    await createTrustDeposit(payment.id);
  } catch (e) {
    console.error("Failed to create trust deposit:", e);
  }

  revalidatePath("/rent-collection");
  redirect("/rent-collection");
}

export async function deletePayment(id: string) {
  const userId = await getUserId();
  await db.trustTransaction.deleteMany({ where: { paymentId: id, userId } });
  await db.payment.delete({ where: { id, userId } });
  await recalculateBalances(userId);
  revalidatePath("/payments");
  revalidatePath("/trust");
  revalidatePath("/rent-collection");
  redirect("/payments");
}
