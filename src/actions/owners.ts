"use server";

import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { ownerSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createOwner(formData: FormData) {
  const userId = await getUserId();
  const raw = Object.fromEntries(formData);
  const parsed = ownerSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const owner = await db.owner.create({
    data: {
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      notes: data.notes || null,
    },
  });

  redirect(`/owners/${owner.id}`);
}

export async function updateOwner(id: string, formData: FormData) {
  const userId = await getUserId();
  const raw = Object.fromEntries(formData);
  const parsed = ownerSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  await db.owner.update({
    where: { id, userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      notes: data.notes || null,
    },
  });

  redirect(`/owners/${id}`);
}

export async function deleteOwner(id: string) {
  const userId = await getUserId();
  const propertyCount = await db.property.count({ where: { ownerId: id, userId } });
  if (propertyCount > 0) {
    return { error: "Cannot delete owner with linked properties. Remove properties first." };
  }

  await db.owner.delete({ where: { id, userId } });
  revalidatePath("/owners");
  redirect("/owners");
}
