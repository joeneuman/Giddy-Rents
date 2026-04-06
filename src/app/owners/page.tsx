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
import { Building2, Plus } from "lucide-react";
import { fullName, formatPhone } from "@/lib/format";

export default async function OwnersPage() {
  const owners = await db.owner.findMany({
    orderBy: { lastName: "asc" },
    include: { _count: { select: { properties: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Owners"
        description="Manage property owner contacts"
        action={
          <Button asChild>
            <Link href="/owners/new">
              <Plus className="h-4 w-4 mr-1" />
              Add Owner
            </Link>
          </Button>
        }
      />

      {owners.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No owners yet"
          description="Add your first property owner to get started."
          actionLabel="Add Owner"
          actionHref="/owners/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Properties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell>
                    <Link
                      href={`/owners/${owner.id}`}
                      className="font-medium hover:underline"
                    >
                      {fullName(owner.firstName, owner.lastName)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {owner.email || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {owner.phone ? formatPhone(owner.phone) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {owner._count.properties}
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
