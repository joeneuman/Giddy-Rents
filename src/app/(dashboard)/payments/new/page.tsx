export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { PaymentForm } from "@/components/payments/payment-form";
import { createPayment } from "@/actions/payments";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ leaseId?: string }>;
}) {
  const { leaseId } = await searchParams;
  const userId = await getUserId();

  const leases = await db.lease.findMany({
    where: { status: "active", userId },
    orderBy: { createdAt: "desc" },
    include: {
      tenant: true,
      property: true,
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Record Payment" description="Log a new rent payment" />
      <PaymentForm
        action={createPayment}
        leases={leases}
        defaultLeaseId={leaseId}
        submitLabel="Record Payment"
      />
    </div>
  );
}
