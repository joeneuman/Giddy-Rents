"use server";

import { db } from "@/lib/db";
import { ownerSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOwner(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = ownerSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const owner = await db.owner.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      feeType: data.feeType || null,
      feeAmount: data.feeAmount || null,
      notes: data.notes || null,
    },
  });

  redirect(`/owners/${owner.id}`);
}

export async function updateOwner(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = ownerSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  await db.owner.update({
    where: { id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      feeType: data.feeType || null,
      feeAmount: data.feeAmount || null,
      notes: data.notes || null,
    },
  });

  redirect(`/owners/${id}`);
}

export async function deleteOwner(id: string) {
  const propertyCount = await db.property.count({ where: { ownerId: id } });
  if (propertyCount > 0) {
    return { error: "Cannot delete owner with linked properties. Remove properties first." };
  }

  await db.owner.delete({ where: { id } });
  revalidatePath("/owners");
  redirect("/owners");
}
