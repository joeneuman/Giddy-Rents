import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const leaseId = formData.get("leaseId") as string | null;
  const description = formData.get("description") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!leaseId) {
    return NextResponse.json({ error: "Lease ID is required" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "uploads", "contracts");
  await mkdir(uploadsDir, { recursive: true });

  const id = randomUUID();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedFileName = `${id}-${safeFileName}`;
  const filePath = path.join(uploadsDir, storedFileName);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const contract = await db.contract.create({
    data: {
      leaseId,
      fileName: file.name,
      filePath: storedFileName,
      fileSize: file.size,
      description: description || null,
    },
  });

  return NextResponse.json({ success: true, contract });
}
