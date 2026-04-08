import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { OwnerForm } from "@/components/owners/owner-form";
import { updateOwner } from "@/actions/owners";
import { fullName } from "@/lib/format";

export default async function EditOwnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserId();
  const owner = await db.owner.findFirst({ where: { id, userId } });

  if (!owner) notFound();

  const updateWithId = updateOwner.bind(null, id);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={`Edit ${fullName(owner.firstName, owner.lastName)}`}
        description="Update owner information"
      />
      <OwnerForm action={updateWithId} defaultValues={owner} submitLabel="Update Owner" />
    </div>
  );
}
