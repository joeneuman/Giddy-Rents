import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { deleteOwner } from "@/actions/owners";
import { fullName, formatPhone, formatDate, formatCurrency } from "@/lib/format";
import { getOwnerTrustBalance } from "@/lib/trust";
import { Pencil, Mail, Phone, MapPin, Home, Landmark, Banknote, DollarSign } from "lucide-react";

export default async function OwnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserId();
  const [owner, trustBalance, recentPayouts] = await Promise.all([
    db.owner.findFirst({
      where: { id, userId },
      include: {
        properties: { orderBy: { name: "asc" } },
      },
    }),
    getOwnerTrustBalance(userId, id),
    db.trustTransaction.findMany({
      where: { ownerId: id, userId, type: { in: ["owner_payout", "company_fee"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Trust Account
          </CardTitle>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/trust/owner-deposit?ownerId=${id}`}>
                <Landmark className="h-4 w-4 mr-1" />
                Owner Deposit
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/trust/pay-owner?ownerId=${id}`}>
                <Banknote className="h-4 w-4 mr-1" />
                Pay Owner
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trust Balance (Owner Funds)</span>
            <span className="text-lg font-bold">{formatCurrency(trustBalance)}</span>
          </div>

          {recentPayouts.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Recent Payouts</p>
              <div className="space-y-2">
                {recentPayouts.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded border text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{tx.description}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-600">{formatCurrency(tx.amount)}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
