export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { SecurityDepositForm } from "@/components/trust/security-deposit-form";
import { createSecurityDeposit } from "@/actions/trust";

export default async function SecurityDepositPage({
  searchParams,
}: {
  searchParams: Promise<{ leaseId?: string }>;
}) {
  const { leaseId } = await searchParams;

  const leases = await db.lease.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    include: {
      tenant: { select: { firstName: true, lastName: true } },
      property: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Security Deposit" description="Record a security deposit or refund" />
      <SecurityDepositForm
        action={createSecurityDeposit}
        leases={leases}
        defaultLeaseId={leaseId}
      />
    </div>
  );
}
