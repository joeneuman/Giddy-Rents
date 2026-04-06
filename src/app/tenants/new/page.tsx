import { PageHeader } from "@/components/layout/page-header";
import { TenantForm } from "@/components/tenants/tenant-form";
import { createTenant } from "@/actions/tenants";

export default function NewTenantPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Add Tenant" description="Create a new tenant record" />
      <TenantForm action={createTenant} submitLabel="Create Tenant" />
    </div>
  );
}
