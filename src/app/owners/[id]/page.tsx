import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { deleteOwner } from "@/actions/owners";
import { fullName, formatPhone, formatDate } from "@/lib/format";
import { Pencil, Mail, Phone, MapPin, Home } from "lucide-react";

export default async function OwnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await db.owner.findUnique({
    where: { id },
    include: {
      properties: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!owner) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName(owner.firstName, owner.lastName)}
        description="Property Owner"
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/owners/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
            <DeleteDialog
              title="Delete Owner"
              description="Are you sure you want to delete this owner? This action cannot be undone."
              onDelete={async () => {
                "use server";
                await deleteOwner(id);
              }}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {owner.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${owner.email}`} className="hover:underline">
                  {owner.email}
                </a>
              </div>
            )}
            {owner.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {formatPhone(owner.phone)}
              </div>
            )}
            {owner.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {owner.address}
              </div>
            )}
            {owner.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">{owner.notes}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-2">
              Added {formatDate(owner.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Properties ({owner.properties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {owner.properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">No properties linked to this owner.</p>
            ) : (
              <div className="space-y-3">
                {owner.properties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <Home className="h-4 w-4 text-muted-foreground" />
                    {property.name}
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
