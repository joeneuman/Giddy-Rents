import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { deleteTenant } from "@/actions/tenants";
import { fullName, formatPhone, formatDate, formatCurrency } from "@/lib/format";
import { getSecurityDepositBalance } from "@/lib/trust";
import { Pencil, Mail, Phone, MapPin, AlertTriangle, Home, DollarSign, Shield } from "lucide-react";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const securityBalance = await getSecurityDepositBalance(id);
  const tenant = await db.tenant.findUnique({
    where: { id },
    include: {
      leases: {
        include: { property: true },
        orderBy: { startDate: "desc" },
      },
      payments: {
        orderBy: { datePaid: "desc" },
        take: 10,
        include: { lease: { include: { property: true } } },
      },
    },
  });

  if (!tenant) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName(tenant.firstName, tenant.lastName)}
        description="Tenant"
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/tenants/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
            <DeleteDialog
              title="Delete Tenant"
              description="Are you sure you want to delete this tenant? This action cannot be undone."
              onDelete={async () => {
                "use server";
                await deleteTenant(id);
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
            {tenant.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${tenant.email}`} className="hover:underline">
                  {tenant.email}
                </a>
              </div>
            )}
            {tenant.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {formatPhone(tenant.phone)}
              </div>
            )}
            {tenant.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {tenant.address}
              </div>
            )}
            {tenant.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">{tenant.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenant.emergencyName ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  {tenant.emergencyName}
                  {tenant.emergencyRelation && (
                    <span className="text-muted-foreground">
                      ({tenant.emergencyRelation})
                    </span>
                  )}
                </div>
                {tenant.emergencyPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {formatPhone(tenant.emergencyPhone)}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No emergency contact on file.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Deposit
          </CardTitle>
          {tenant.leases.length > 0 && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/trust/security-deposit?leaseId=${tenant.leases[0]?.id}`}>
                Record Deposit
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount Held</span>
            <span className="text-lg font-bold">{formatCurrency(securityBalance)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leases ({tenant.leases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tenant.leases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leases found.</p>
          ) : (
            <div className="space-y-3">
              {tenant.leases.map((lease) => (
                <Link
                  key={lease.id}
                  href={`/leases/${lease.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{lease.property.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(lease.startDate)} — {lease.endDate ? formatDate(lease.endDate) : "Month-to-month"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatCurrency(lease.rentAmount)}/mo</span>
                    <StatusBadge status={lease.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {tenant.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded.</p>
          ) : (
            <div className="space-y-3">
              {tenant.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.lease.property.name} — {payment.method}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(payment.datePaid)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
