import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { TenantForm } from "@/components/tenants/tenant-form";
import { updateTenant } from "@/actions/tenants";
import { fullName } from "@/lib/format";

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await db.tenant.findUnique({ where: { id } });

  if (!tenant) notFound();

  const updateWithId = updateTenant.bind(null, id);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={`Edit ${fullName(tenant.firstName, tenant.lastName)}`}
        description="Update tenant information"
      />
      <TenantForm action={updateWithId} defaultValues={tenant} submitLabel="Update Tenant" />
    </div>
  );
}
