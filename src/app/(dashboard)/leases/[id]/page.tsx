import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { deleteLease } from "@/actions/leases";
import { formatCurrency, fullName, formatDate } from "@/lib/format";
import { Pencil, Home, Users, DollarSign, FileText, Calendar, Plus } from "lucide-react";
import { ContractUpload } from "@/components/contracts/contract-upload";
import { ContractList } from "@/components/contracts/contract-list";

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserId();
  const lease = await db.lease.findFirst({
    where: { id, userId },
    include: {
      tenant: true,
      property: { include: { owner: true } },
      payments: { orderBy: { datePaid: "desc" } },
      contracts: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!lease) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Lease — ${lease.property.name}`}
        description={`${fullName(lease.tenant.firstName, lease.tenant.lastName)}`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/leases/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
            <DeleteDialog
              title="Delete Lease"
              description="Are you sure you want to delete this lease? This action cannot be undone."
              onDelete={async () => {
                "use server";
                await deleteLease(id);
              }}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lease Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={lease.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly Rent</span>
              <span className="font-bold">{formatCurrency(lease.rentAmount)}</span>
            </div>
            {lease.securityDeposit && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Security Deposit</span>
                <span>{formatCurrency(lease.securityDeposit)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Start Date</span>
              <span className="text-sm">{formatDate(lease.startDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">End Date</span>
              <span className="text-sm">
                {lease.endDate ? formatDate(lease.endDate) : "Month-to-month"}
              </span>
            </div>
            {lease.notes && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">{lease.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href={`/tenants/${lease.tenant.id}`}
              className="flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              {fullName(lease.tenant.firstName, lease.tenant.lastName)}
            </Link>
            {lease.tenant.email && (
              <p className="text-sm text-muted-foreground ml-6">{lease.tenant.email}</p>
            )}
            {lease.tenant.phone && (
              <p className="text-sm text-muted-foreground ml-6">{lease.tenant.phone}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href={`/properties/${lease.property.id}`}
              className="flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <Home className="h-4 w-4 text-muted-foreground" />
              {lease.property.name}
            </Link>
            <p className="text-sm text-muted-foreground ml-6">
              {lease.property.address}, {lease.property.city}, {lease.property.state}
            </p>
            <p className="text-sm text-muted-foreground ml-6">
              Owner: {fullName(lease.property.owner.firstName, lease.property.owner.lastName)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Contracts ({lease.contracts.length})</CardTitle>
          <ContractUpload leaseId={id} />
        </CardHeader>
        <CardContent>
          <ContractList contracts={lease.contracts} />
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Payments ({lease.payments.length})</CardTitle>
          <Button asChild size="sm">
            <Link href={`/payments/new?leaseId=${id}`}>
              <Plus className="h-4 w-4 mr-1" />
              Record Payment
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {lease.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded.</p>
          ) : (
            <div className="space-y-3">
              {lease.payments.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/payments/${payment.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.method} — Period: {formatDate(payment.periodStart)} to {formatDate(payment.periodEnd)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDate(payment.datePaid)}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
