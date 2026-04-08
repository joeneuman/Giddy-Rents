"use server";

import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { propertySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProperty(formData: FormData) {
  const userId = await getUserId();
  const raw = Object.fromEntries(formData);
  const parsed = propertySchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const property = await db.property.create({
    data: {
      userId,
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      type: data.type,
      bedrooms: data.bedrooms || null,
      bathrooms: data.bathrooms || null,
      sqft: data.sqft || null,
      rentAmount: data.rentAmount,
      feeType: data.feeType || null,
      feeAmount: data.feeAmount || null,
      ownerId: data.ownerId,
      notes: data.notes || null,
    },
  });

  redirect(`/properties/${property.id}`);
}

export async function updateProperty(id: string, formData: FormData) {
  const userId = await getUserId();
  const raw = Object.fromEntries(formData);
  const parsed = propertySchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  await db.property.update({
    where: { id, userId },
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      type: data.type,
      bedrooms: data.bedrooms || null,
      bathrooms: data.bathrooms || null,
      sqft: data.sqft || null,
      rentAmount: data.rentAmount,
      feeType: data.feeType || null,
      feeAmount: data.feeAmount || null,
      ownerId: data.ownerId,
      notes: data.notes || null,
    },
  });

  redirect(`/properties/${id}`);
}

export async function deleteProperty(id: string) {
  const userId = await getUserId();
  const leaseCount = await db.lease.count({ where: { propertyId: id, userId } });
  if (leaseCount > 0) {
    return { error: "Cannot delete property with linked leases. Remove leases first." };
  }

  await db.property.delete({ where: { id, userId } });
  revalidatePath("/properties");
  redirect("/properties");
}
