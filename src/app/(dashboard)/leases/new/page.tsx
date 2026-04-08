export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { LeaseForm } from "@/components/leases/lease-form";
import { createLease } from "@/actions/leases";

export default async function NewLeasePage() {
  const [tenants, properties] = await Promise.all([
    db.tenant.findMany({ orderBy: { lastName: "asc" } }),
    db.property.findMany({
      orderBy: { name: "asc" },
      include: { owner: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Add Lease" description="Create a new lease agreement" />
      <LeaseForm
        action={createLease}
        tenants={tenants}
        properties={properties}
        submitLabel="Create Lease"
      />
    </div>
  );
}
