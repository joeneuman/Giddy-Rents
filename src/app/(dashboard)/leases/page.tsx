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
import { FileText, Plus } from "lucide-react";
import { formatCurrency, fullName, formatDate } from "@/lib/format";

export default async function LeasesPage() {
  const userId = await getUserId();
  const leases = await db.lease.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      tenant: true,
      property: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leases"
        description="Manage rental lease agreements"
        action={
          <Button asChild>
            <Link href="/leases/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Lease
            </Link>
          </Button>
        }
      />

      {leases.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No leases yet"
          description="Create your first lease agreement to get started."
          actionLabel="Add Lease"
          actionHref="/leases/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leases.map((lease) => (
                <TableRow key={lease.id}>
                  <TableCell>
                    <Link
                      href={`/leases/${lease.id}`}
                      className="font-medium hover:underline"
                    >
                      {lease.property.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/tenants/${lease.tenant.id}`}
                      className="hover:underline"
                    >
                      {fullName(lease.tenant.firstName, lease.tenant.lastName)}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(lease.startDate)}</TableCell>
                  <TableCell>
                    {lease.endDate ? formatDate(lease.endDate) : "Month-to-month"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(lease.rentAmount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lease.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
