import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { deletePayment } from "@/actions/payments";
import { formatCurrency, fullName, formatDate } from "@/lib/format";
import { Home, Users, Calendar, CreditCard, Hash } from "lucide-react";

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserId();
  const payment = await db.payment.findFirst({
    where: { id, userId },
    include: {
      tenant: true,
      lease: { include: { property: true } },
    },
  });

  if (!payment) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Payment — ${formatCurrency(payment.amount)}`}
        description={`Paid on ${formatDate(payment.datePaid)}`}
        action={
          <DeleteDialog
            title="Delete Payment"
            description="Are you sure you want to delete this payment record? This action cannot be undone."
            onDelete={async () => {
              "use server";
              await deletePayment(id);
            }}
          />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-xl font-bold">{formatCurrency(payment.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Date Paid</span>
              <span className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4" />
                {formatDate(payment.datePaid)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Method</span>
              <Badge variant="outline" className="capitalize">
                <CreditCard className="h-3 w-3 mr-1" />
                {payment.method.replace("_", " ")}
              </Badge>
            </div>
            {payment.referenceNumber && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reference #</span>
                <span className="flex items-center gap-1 text-sm">
                  <Hash className="h-4 w-4" />
                  {payment.referenceNumber}
                </span>
              </div>
            )}
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-1">Period Covered</p>
              <p className="text-sm">
                {formatDate(payment.periodStart)} — {formatDate(payment.periodEnd)}
              </p>
            </div>
            {payment.notes && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">{payment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Linked Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tenant</p>
              <Link
                href={`/tenants/${payment.tenant.id}`}
                className="flex items-center gap-2 text-sm font-medium hover:underline"
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                {fullName(payment.tenant.firstName, payment.tenant.lastName)}
              </Link>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Property</p>
              <Link
                href={`/properties/${payment.lease.property.id}`}
                className="flex items-center gap-2 text-sm font-medium hover:underline"
              >
                <Home className="h-4 w-4 text-muted-foreground" />
                {payment.lease.property.name}
              </Link>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Lease</p>
              <Link
                href={`/leases/${payment.lease.id}`}
                className="flex items-center gap-2 text-sm font-medium hover:underline"
              >
                {payment.lease.property.name} lease
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
