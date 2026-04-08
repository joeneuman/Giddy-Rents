import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { LeaseForm } from "@/components/leases/lease-form";
import { updateLease } from "@/actions/leases";

export default async function EditLeasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserId();
  const [lease, tenants, properties] = await Promise.all([
    db.lease.findFirst({ where: { id, userId } }),
    db.tenant.findMany({ where: { userId }, orderBy: { lastName: "asc" } }),
    db.property.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: { owner: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  if (!lease) notFound();

  const updateWithId = updateLease.bind(null, id);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Edit Lease" description="Update lease agreement details" />
      <LeaseForm
        action={updateWithId}
        tenants={tenants}
        properties={properties}
        defaultValues={lease}
        submitLabel="Update Lease"
      />
    </div>
  );
}
