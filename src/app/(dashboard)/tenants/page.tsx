export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { Users, Plus } from "lucide-react";
import { fullName, formatPhone } from "@/lib/format";

export default async function TenantsPage() {
  const userId = await getUserId();
  const tenants = await db.tenant.findMany({
    where: { userId },
    orderBy: { lastName: "asc" },
    include: {
      leases: {
        where: { status: "active" },
        include: { property: true },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description="Manage tenant contacts and information"
        action={
          <Button asChild>
            <Link href="/tenants/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Tenant
            </Link>
          </Button>
        }
      />

      {tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants yet"
          description="Add your first tenant to get started."
          actionLabel="Add Tenant"
          actionHref="/tenants/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Current Property</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => {
                const activeLease = tenant.leases[0];
                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <Link
                        href={`/tenants/${tenant.id}`}
                        className="font-medium hover:underline"
                      >
                        {fullName(tenant.firstName, tenant.lastName)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tenant.email || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {tenant.phone ? formatPhone(tenant.phone) : "—"}
                    </TableCell>
                    <TableCell>
                      {activeLease ? (
                        <Link
                          href={`/properties/${activeLease.property.id}`}
                          className="hover:underline"
                        >
                          {activeLease.property.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {activeLease ? (
                        <StatusBadge status="active" />
                      ) : (
                        <StatusBadge status="inactive" />
                      )}
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
