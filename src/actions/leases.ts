"use server";

import { db } from "@/lib/db";
import { leaseSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createLease(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = leaseSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const lease = await db.lease.create({
    data: {
      propertyId: data.propertyId,
      tenantId: data.tenantId,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      rentAmount: data.rentAmount,
      securityDeposit: data.securityDeposit || null,
      status: data.status,
      notes: data.notes || null,
    },
  });

  redirect(`/leases/${lease.id}`);
}

export async function updateLease(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = leaseSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  await db.lease.update({
    where: { id },
    data: {
      propertyId: data.propertyId,
      tenantId: data.tenantId,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      rentAmount: data.rentAmount,
      securityDeposit: data.securityDeposit || null,
      status: data.status,
      notes: data.notes || null,
    },
  });

  redirect(`/leases/${id}`);
}

export async function deleteLease(id: string) {
  const paymentCount = await db.payment.count({ where: { leaseId: id } });
  if (paymentCount > 0) {
    return { error: "Cannot delete lease with recorded payments. Remove payments first." };
  }

  const contractCount = await db.contract.count({ where: { leaseId: id } });
  if (contractCount > 0) {
    return { error: "Cannot delete lease with uploaded contracts. Remove contracts first." };
  }

  await db.lease.delete({ where: { id } });
  revalidatePath("/leases");
  redirect("/leases");
}
