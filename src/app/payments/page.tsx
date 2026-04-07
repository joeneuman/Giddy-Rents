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
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { deletePayment } from "@/actions/payments";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus } from "lucide-react";
import { formatCurrency, fullName, formatDate } from "@/lib/format";

export default async function PaymentsPage() {
  const payments = await db.payment.findMany({
    orderBy: { datePaid: "desc" },
    include: {
      tenant: true,
      lease: { include: { property: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="View and record rent payments"
        action={
          <Button asChild>
            <Link href="/payments/new">
              <Plus className="h-4 w-4 mr-1" />
              Record Payment
            </Link>
          </Button>
        }
      />

      {payments.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No payments yet"
          description="Record your first rent payment to get started."
          actionLabel="Record Payment"
          actionHref="/payments/new"
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Link
                      href={`/payments/${payment.id}`}
                      className="font-medium hover:underline"
                    >
                      {formatDate(payment.datePaid)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/tenants/${payment.tenant.id}`}
                      className="hover:underline"
                    >
                      {fullName(payment.tenant.firstName, payment.tenant.lastName)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/properties/${payment.lease.property.id}`}
                      className="hover:underline"
                    >
                      {payment.lease.property.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {payment.method.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(payment.periodStart)} — {formatDate(payment.periodEnd)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <DeleteDialog
                      title="Delete Payment"
                      description="This will also remove the linked trust account deposit. Are you sure?"
                      onDelete={async () => {
                        "use server";
                        await deletePayment(payment.id);
                      }}
                    />
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
