export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, DollarSign, AlertTriangle } from "lucide-react";
import { formatCurrency, fullName, formatDate } from "@/lib/format";
import { startOfMonth, endOfMonth } from "date-fns";

async function getDashboardData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    activeTenantCount,
    totalProperties,
    monthlyPayments,
    recentPayments,
    activeLeases,
  ] = await Promise.all([
    db.lease.count({ where: { status: "active" } }),
    db.property.count(),
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        datePaid: { gte: monthStart, lte: monthEnd },
      },
    }),
    db.payment.findMany({
      orderBy: { datePaid: "desc" },
      take: 8,
      include: {
        tenant: true,
        lease: { include: { property: true } },
      },
    }),
    db.lease.findMany({
      where: { status: "active" },
      include: {
        tenant: true,
        property: true,
        payments: {
          where: {
            periodStart: { lte: monthEnd },
            periodEnd: { gte: monthStart },
          },
        },
      },
    }),
  ]);

  const overdueLeases = activeLeases.filter(
    (lease) => lease.payments.length === 0
  );

  return {
    activeTenantCount,
    totalProperties,
    monthlyRevenue: monthlyPayments._sum.amount || 0,
    overdueCount: overdueLeases.length,
    recentPayments,
    overdueLeases,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your rental portfolio"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tenants</p>
                <p className="text-3xl font-bold">{data.activeTenantCount}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Properties</p>
                <p className="text-3xl font-bold">{data.totalProperties}</p>
              </div>
              <Home className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(data.monthlyRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card className={data.overdueCount > 0 ? "border-destructive" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold">{data.overdueCount}</p>
              </div>
              <AlertTriangle
                className={`h-8 w-8 ${
                  data.overdueCount > 0
                    ? "text-destructive"
                    : "text-muted-foreground/30"
                }`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Overdue Rent — This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.overdueLeases.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                All active tenants are paid up for this month.
              </p>
            ) : (
              <div className="space-y-3">
                {data.overdueLeases.map((lease) => (
                  <Link
                    key={lease.id}
                    href={`/leases/${lease.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {fullName(lease.tenant.firstName, lease.tenant.lastName)}
                      </p>
                      <p className="text-xs text-muted-foreground">{lease.property.name}</p>
                    </div>
                    <span className="font-bold text-destructive">
                      {formatCurrency(lease.rentAmount)}
                    </span>
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
            {data.recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentPayments.map((payment) => (
                  <Link
                    key={payment.id}
                    href={`/payments/${payment.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {fullName(payment.tenant.firstName, payment.tenant.lastName)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.lease.property.name} — {formatDate(payment.datePaid)}
                      </p>
                    </div>
                    <span className="font-bold text-green-600">
                      {formatCurrency(payment.amount)}
                    </span>
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
