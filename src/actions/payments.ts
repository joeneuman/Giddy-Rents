"use server";

import { db } from "@/lib/db";
import { paymentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPayment(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = paymentSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const payment = await db.payment.create({
    data: {
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

  redirect(`/payments/${payment.id}`);
}

export async function deletePayment(id: string) {
  await db.payment.delete({ where: { id } });
  revalidatePath("/payments");
  redirect("/payments");
}
