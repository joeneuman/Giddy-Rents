export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { PropertyForm } from "@/components/properties/property-form";
import { createProperty } from "@/actions/properties";

export default async function NewPropertyPage() {
  const userId = await getUserId();

  const owners = await db.owner.findMany({ where: { userId }, orderBy: { lastName: "asc" } });

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Add Property" description="Create a new rental property" />
      <PropertyForm action={createProperty} owners={owners} submitLabel="Create Property" />
    </div>
  );
}
