export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { QuickPayment } from "@/components/rent-collection/quick-payment";
import { OwnerPayoutRow } from "@/components/rent-collection/owner-payouts";
import { CompanyTransfer } from "@/components/rent-collection/company-transfer";
import { createPaymentFromCollection } from "@/actions/payments";
import { payOwnerFromCycle, transferToOperating } from "@/actions/trust";
import { calculateFee } from "@/lib/trust";
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Banknote,
  ArrowRightLeft,
  Check,
} from "lucide-react";
import { formatCurrency, fullName } from "@/lib/format";
import { startOfMonth, endOfMonth, format, differenceInMonths, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * Check if a payment's period falls in a given month.
 * Uses UTC month/year to avoid timezone issues with stored dates.
 */
function isPaymentForMonth(periodStart: Date, targetMonth: number, targetYear: number): boolean {
  return periodStart.getUTCMonth() === targetMonth && periodStart.getUTCFullYear() === targetYear;
}

/**
 * Calculate how many months of rent are owed from lease start to now.
 * Each 1st of the month adds one month of rent.
 */
function calculateTotalRentOwed(leaseStart: Date, rentAmount: number, now: Date): number {
  const start = startOfMonth(leaseStart);
  const current = startOfMonth(now);
  // Number of months from lease start month through current month (inclusive)
  const months = differenceInMonths(current, start) + 1;
  return Math.max(0, months) * rentAmount;
}

export default async function MonthlyCyclePage() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthLabel = format(now, "MMMM yyyy");
  const currentMonth = now.getMonth(); // 0-indexed
  const currentYear = now.getFullYear();

  // Fetch all active leases with ALL payments (for running balance) and this month's owner payouts
  const leases = await db.lease.findMany({
    where: { status: "active" },
    include: {
      tenant: true,
      property: { include: { owner: true } },
      payments: {
        orderBy: { datePaid: "asc" },
      },
      trustTransactions: {
        where: {
          type: "owner_payout",
          date: { gte: monthStart, lte: monthEnd },
        },
      },
    },
  });

  // Fetch company fees and transfer for this month
  const [companyFeesResult, companyTransfer] = await Promise.all([
    db.trustTransaction.aggregate({
      _sum: { amount: true },
      where: {
        type: "company_fee",
        date: { gte: monthStart, lte: monthEnd },
      },
    }),
    db.trustTransaction.findFirst({
      where: {
        type: "company_transfer",
        date: { gte: monthStart, lte: monthEnd },
      },
    }),
  ]);

  const totalCompanyFees = Math.abs(companyFeesResult._sum.amount ?? 0);
  const transferDone = !!companyTransfer;

  // === SECTION 1: Rent Collection ===
  const rentRows = leases.map((lease) => {
    // Running balance: total rent owed since ledger start (or lease start) minus all payments
    const effectiveStart = lease.ledgerStartDate ?? lease.startDate;
    const totalRentOwed = calculateTotalRentOwed(effectiveStart, lease.rentAmount, now);
    const totalPaid = lease.payments.reduce((sum, p) => sum + p.amount, 0);
    const runningBalance = (lease.openingBalance ?? 0) + totalRentOwed - totalPaid;

    // This month's payments only (for the "paid this month" column)
    const paidThisMonth = lease.payments
      .filter((p) => isPaymentForMonth(p.periodStart, currentMonth, currentYear))
      .reduce((sum, p) => sum + p.amount, 0);

    const status = runningBalance <= 0 ? "paid" : paidThisMonth > 0 ? "partial" : "unpaid";
    return { lease, paidThisMonth, runningBalance, status };
  });

  const statusOrder: Record<string, number> = { unpaid: 0, partial: 1, paid: 2 };
  rentRows.sort((a, b) => (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0));

  const totalExpected = rentRows.reduce((sum, r) => sum + r.lease.rentAmount, 0);
  const totalCollected = rentRows.reduce((sum, r) => sum + r.paidThisMonth, 0);
  const totalOutstanding = rentRows.reduce((sum, r) => sum + Math.max(0, r.runningBalance), 0);
  const rentsPaidCount = rentRows.filter((r) => r.status === "paid").length;
  const allRentCollected = rentsPaidCount === rentRows.length && rentRows.length > 0;

  // === SECTION 2: Owner Payouts ===
  const payoutRows = leases
    .map((lease) => {
      const rentCollected = lease.payments
        .filter((p) => isPaymentForMonth(p.periodStart, currentMonth, currentYear))
        .reduce((sum, p) => sum + p.amount, 0);
      const fee = rentCollected > 0 ? calculateFee(lease.property.feeType, lease.property.feeAmount, rentCollected) : 0;
      const netPayout = rentCollected > 0 ? rentCollected - fee : 0;
      const alreadyPaid = lease.trustTransactions.length > 0;
      const feeLabel = lease.property.feeType === "percentage"
        ? `(${lease.property.feeAmount}%)`
        : lease.property.feeType === "flat"
          ? `($${lease.property.feeAmount} flat)`
          : "";
      return {
        lease,
        rentCollected,
        fee,
        netPayout,
        alreadyPaid,
        feeLabel,
      };
    });

  const ownersPaidCount = payoutRows.filter((r) => r.alreadyPaid).length;
  const allOwnersPaid = ownersPaidCount === payoutRows.length && payoutRows.length > 0;
  const hasAnyRentCollected = payoutRows.length > 0;
  const hasAnyOwnerPaid = ownersPaidCount > 0;
  const projectedFees = payoutRows.reduce((sum, r) => sum + r.fee, 0);

  // Step status
  const step1Status = allRentCollected ? "done" : rentsPaidCount > 0 ? "partial" : "active";
  const step2Status = !hasAnyRentCollected ? "locked" : allOwnersPaid ? "done" : ownersPaidCount > 0 ? "partial" : "active";
  const step3Status = !hasAnyOwnerPaid ? "locked" : transferDone ? "done" : "active";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monthly Cycle"
        description={monthLabel}
      />

      {/* SECTION 1: Collect Rent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Step 1: Collect Rent
            {allRentCollected && <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Expected</p>
              <p className="text-lg font-bold">{formatCurrency(totalExpected)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalCollected)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className={cn("text-lg font-bold", totalOutstanding > 0 && "text-red-600")}>
                {formatCurrency(totalOutstanding)}
              </p>
            </div>
          </div>

          {rentRows.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No active leases"
              description="Create a lease to start collecting rent."
              actionLabel="Create Lease"
              actionHref="/leases/new"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="text-right">Rent</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentRows.map(({ lease, paidThisMonth, runningBalance, status }) => (
                  <TableRow
                    key={lease.id}
                    className={cn(
                      status === "paid" && "bg-green-50/50",
                      status === "partial" && "bg-yellow-50/50",
                      status === "unpaid" && "bg-red-50/50"
                    )}
                  >
                    <TableCell className="w-8">
                      {status === "paid" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {status === "partial" && <Clock className="h-4 w-4 text-yellow-600" />}
                      {status === "unpaid" && <AlertCircle className="h-4 w-4 text-red-600" />}
                    </TableCell>
                    <TableCell>
                      <Link href={`/tenants/${lease.tenant.id}`} className="font-medium hover:underline">
                        {fullName(lease.tenant.firstName, lease.tenant.lastName)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/properties/${lease.property.id}`} className="hover:underline">
                        {lease.property.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(lease.rentAmount)}</TableCell>
                    <TableCell className="text-right">
                      {paidThisMonth > 0 ? (
                        <span className="text-green-600 font-medium">{formatCurrency(paidThisMonth)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {runningBalance > 0 ? (
                        <span className="text-red-600 font-bold">{formatCurrency(runningBalance)}</span>
                      ) : (
                        <span className="text-green-600 font-medium">Paid</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <QuickPayment
                        action={createPaymentFromCollection}
                        leaseId={lease.id}
                        tenantId={lease.tenant.id}
                        tenantName={fullName(lease.tenant.firstName, lease.tenant.lastName)}
                        propertyName={lease.property.name}
                        runningBalance={runningBalance > 0 ? runningBalance : 0}
                        rentAmount={lease.rentAmount}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: Pay Owners & Transfer */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Step 2: Pay Owners & Transfer to Operating
              {allOwnersPaid && transferDone && <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Net Payout</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRows.map(({ lease, rentCollected, fee, netPayout, alreadyPaid, feeLabel }) => (
                  <TableRow
                    key={lease.id}
                    className={alreadyPaid ? "bg-green-50/50" : ""}
                  >
                    <TableCell>
                      <Link href={`/owners/${lease.property.owner.id}`} className="font-medium hover:underline">
                        {fullName(lease.property.owner.firstName, lease.property.owner.lastName)}
                      </Link>
                    </TableCell>
                    <TableCell>{lease.property.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(rentCollected)}</TableCell>
                    <TableCell className="text-right text-red-600">
                      {fee > 0 ? `-${formatCurrency(fee)}` : "—"}
                      {feeLabel && <span className="text-xs text-muted-foreground ml-1">{feeLabel}</span>}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {formatCurrency(netPayout)}
                    </TableCell>
                    <TableCell>
                      <OwnerPayoutRow
                        action={payOwnerFromCycle}
                        ownerId={lease.property.owner.id}
                        ownerName={fullName(lease.property.owner.firstName, lease.property.owner.lastName)}
                        leaseId={lease.id}
                        propertyName={lease.property.name}
                        rentCollected={rentCollected}
                        fee={fee}
                        netPayout={netPayout}
                        feeLabel={feeLabel}
                        alreadyPaid={alreadyPaid}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="text-sm text-muted-foreground">Company Fees Earned</p>
                <p className="text-2xl font-bold">{formatCurrency(projectedFees)}</p>
              </div>
              {transferDone ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Transferred</span>
                </div>
              ) : projectedFees > 0 ? (
                <CompanyTransfer action={transferToOperating} amount={projectedFees} />
              ) : (
                <p className="text-sm text-muted-foreground">No fees to transfer yet</p>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

function StepIndicator({
  number,
  label,
  detail,
  status,
}: {
  number: number;
  label: string;
  detail: string;
  status: "active" | "partial" | "done" | "locked";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm",
        status === "done" && "bg-green-100 text-green-800",
        status === "active" && "bg-primary/10 text-primary font-medium",
        status === "partial" && "bg-yellow-100 text-yellow-800",
        status === "locked" && "bg-muted text-muted-foreground"
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
          status === "done" && "bg-green-600 text-white",
          status === "active" && "bg-primary text-primary-foreground",
          status === "partial" && "bg-yellow-600 text-white",
          status === "locked" && "bg-muted-foreground/30 text-muted-foreground"
        )}
      >
        {status === "done" ? <Check className="h-3.5 w-3.5" /> : number}
      </div>
      <span>{label}</span>
      <span className="text-xs opacity-70">{detail}</span>
    </div>
  );
}
