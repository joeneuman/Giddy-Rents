import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { PropertyForm } from "@/components/properties/property-form";
import { updateProperty } from "@/actions/properties";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [property, owners] = await Promise.all([
    db.property.findUnique({ where: { id } }),
    db.owner.findMany({ orderBy: { lastName: "asc" } }),
  ]);

  if (!property) notFound();

  const updateWithId = updateProperty.bind(null, id);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title={`Edit ${property.name}`} description="Update property information" />
      <PropertyForm
        action={updateWithId}
        owners={owners}
        defaultValues={property}
        submitLabel="Update Property"
      />
    </div>
  );
}
