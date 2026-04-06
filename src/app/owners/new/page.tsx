import { PageHeader } from "@/components/layout/page-header";
import { OwnerForm } from "@/components/owners/owner-form";
import { createOwner } from "@/actions/owners";

export default function NewOwnerPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Add Owner" description="Create a new property owner" />
      <OwnerForm action={createOwner} submitLabel="Create Owner" />
    </div>
  );
}
