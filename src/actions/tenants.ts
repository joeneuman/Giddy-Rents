"use server";

import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { tenantSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTenant(formData: FormData) {
  const userId = await getUserId();
  const raw = Object.fromEntries(formData);
  const parsed = tenantSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const tenant = await db.tenant.create({
    data: {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      emergencyName: data.emergencyName || null,
      emergencyPhone: data.emergencyPhone || null,
      emergencyRelation: data.emergencyRelation || null,
      notes: data.notes || null,
    },
  });

  redirect(`/tenants/${tenant.id}`);
}

export async function updateTenant(id: string, formData: FormData) {
  const userId = await getUserId();
  const raw = Object.fromEntries(formData);
  const parsed = tenantSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  await db.tenant.update({
    where: { id, userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      emergencyName: data.emergencyName || null,
      emergencyPhone: data.emergencyPhone || null,
      emergencyRelation: data.emergencyRelation || null,
      notes: data.notes || null,
    },
  });

  redirect(`/tenants/${id}`);
}

export async function deleteTenant(id: string) {
  const userId = await getUserId();
  const leaseCount = await db.lease.count({ where: { tenantId: id, userId } });
  if (leaseCount > 0) {
    return { error: "Cannot delete tenant with linked leases. Remove leases first." };
  }

  await db.tenant.delete({ where: { id, userId } });
  revalidatePath("/tenants");
  redirect("/tenants");
}
