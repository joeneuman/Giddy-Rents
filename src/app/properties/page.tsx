export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Home, Plus } from "lucide-react";
import { formatCurrency, fullName } from "@/lib/format";

export default async function PropertiesPage() {
  const properties = await db.property.findMany({
    orderBy: { name: "asc" },
    include: {
      owner: true,
      leases: {
        where: { status: "active" },
        include: { tenant: true },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description="Manage rental properties"
        action={
          <Button asChild>
            <Link href="/properties/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Property
            </Link>
          </Button>
        }
      />

      {properties.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No properties yet"
          description="Add your first rental property to get started."
          actionLabel="Add Property"
          actionHref="/properties/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Current Tenant</TableHead>
                <TableHead className="text-right">Proposed Rent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => {
                const activeLease = property.leases[0];
                return (
                  <TableRow key={property.id}>
                    <TableCell>
                      <Link
                        href={`/properties/${property.id}`}
                        className="font-medium hover:underline"
                      >
                        {property.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {property.city}, {property.state}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {property.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/owners/${property.owner.id}`}
                        className="hover:underline"
                      >
                        {fullName(property.owner.firstName, property.owner.lastName)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {activeLease ? (
                        <Link
                          href={`/tenants/${activeLease.tenant.id}`}
                          className="hover:underline"
                        >
                          {fullName(activeLease.tenant.firstName, activeLease.tenant.lastName)}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Vacant</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(property.rentAmount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
