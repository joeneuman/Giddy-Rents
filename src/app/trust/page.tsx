export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Landmark, Banknote, Shield, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate, fullName } from "@/lib/format";
import { getCurrentTrustBalance } from "@/lib/trust";

const typeConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  deposit: { label: "Rent Deposit", variant: "default" },
  owner_payout: { label: "Owner Payout", variant: "secondary" },
  company_fee: { label: "Company Fee", variant: "outline" },
  security_deposit_in: { label: "Security Deposit", variant: "default" },
  security_deposit_refund: { label: "Deposit Refund", variant: "destructive" },
};

export default async function TrustAccountPage() {
  const [balance, transactions, securityTotal] = await Promise.all([
    getCurrentTrustBalance(),
    db.trustTransaction.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        owner: true,
        tenant: true,
        lease: { include: { property: true } },
      },
    }),
    db.trustTransaction.aggregate({
      _sum: { amount: true },
      where: { type: { in: ["security_deposit_in", "security_deposit_refund"] } },
    }),
  ]);

  const securityHeld = securityTotal._sum.amount ?? 0;
  const ownerFunds = balance - securityHeld;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trust Account"
        description="Company trust account ledger"
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/trust/security-deposit">
                <Shield className="h-4 w-4 mr-1" />
                Security Deposit
              </Link>
            </Button>
            <Button asChild>
              <Link href="/trust/pay-owner">
                <Banknote className="h-4 w-4 mr-1" />
                Pay Owner
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
              </div>
              <Landmark className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Owner Funds</p>
                <p className="text-3xl font-bold">{formatCurrency(ownerFunds)}</p>
              </div>
              <Banknote className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Security Deposits</p>
                <p className="text-3xl font-bold">{formatCurrency(securityHeld)}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="No transactions yet"
          description="Trust account transactions will appear here as payments are recorded."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Related</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const config = typeConfig[tx.type] || { label: tx.type, variant: "outline" as const };
                const isPositive = tx.amount > 0;
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm">{formatDate(tx.date)}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {tx.description}
                    </TableCell>
                    <TableCell className="text-sm">
                      {tx.tenant && (
                        <Link href={`/tenants/${tx.tenant.id}`} className="hover:underline">
                          {fullName(tx.tenant.firstName, tx.tenant.lastName)}
                        </Link>
                      )}
                      {tx.owner && !tx.tenant && (
                        <Link href={`/owners/${tx.owner.id}`} className="hover:underline">
                          {fullName(tx.owner.firstName, tx.owner.lastName)}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {isPositive ? "+" : ""}{formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(tx.balance)}
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
