import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { deleteProperty } from "@/actions/properties";
import { formatCurrency, fullName, formatDate } from "@/lib/format";
import { Pencil, MapPin, Building2, Bed, Bath, Maximize, Users } from "lucide-react";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserId();
  const property = await db.property.findFirst({
    where: { id, userId },
    include: {
      owner: true,
      leases: {
        include: { tenant: true },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.name}
        description={`${property.address}, ${property.city}, ${property.state} ${property.zip}`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/properties/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
            <DeleteDialog
              title="Delete Property"
              description="Are you sure you want to delete this property? This action cannot be undone."
              onDelete={async () => {
                "use server";
                await deleteProperty(id);
              }}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {property.address}, {property.city}, {property.state} {property.zip}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="capitalize">{property.type}</Badge>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              {property.bedrooms != null && (
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" /> {property.bedrooms} bed
                </span>
              )}
              {property.bathrooms != null && (
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" /> {property.bathrooms} bath
                </span>
              )}
              {property.sqft != null && (
                <span className="flex items-center gap-1">
                  <Maximize className="h-4 w-4" /> {property.sqft} sqft
                </span>
              )}
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Proposed Rent</p>
              <p className="text-xl font-bold">{formatCurrency(property.rentAmount)}</p>
            </div>
            {property.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">{property.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/owners/${property.owner.id}`}
              className="flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {fullName(property.owner.firstName, property.owner.lastName)}
            </Link>
            {property.owner.email && (
              <p className="text-sm text-muted-foreground mt-1 ml-6">{property.owner.email}</p>
            )}
            {property.owner.phone && (
              <p className="text-sm text-muted-foreground ml-6">{property.owner.phone}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lease History ({property.leases.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {property.leases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leases found.</p>
            ) : (
              <div className="space-y-3">
                {property.leases.map((lease) => (
                  <Link
                    key={lease.id}
                    href={`/leases/${lease.id}`}
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {fullName(lease.tenant.firstName, lease.tenant.lastName)}
                        </span>
                      </div>
                      <StatusBadge status={lease.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      {formatDate(lease.startDate)} — {lease.endDate ? formatDate(lease.endDate) : "Month-to-month"}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
