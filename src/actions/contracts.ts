"use server";

import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export async function deleteContract(id: string, leaseId: string) {
  const userId = await getUserId();
  const contract = await db.contract.findFirst({ where: { id, userId } });
  if (!contract) return;

  try {
    const filePath = path.join(process.cwd(), "uploads", "contracts", contract.filePath);
    await unlink(filePath);
  } catch {
    // File may already be deleted
  }

  await db.contract.delete({ where: { id } });
  revalidatePath(`/leases/${leaseId}`);
}
