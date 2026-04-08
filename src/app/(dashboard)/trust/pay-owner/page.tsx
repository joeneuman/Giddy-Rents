export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { PayOwnerForm } from "@/components/trust/pay-owner-form";
import { createOwnerPayout } from "@/actions/trust";

export default async function PayOwnerPage({
  searchParams,
}: {
  searchParams: Promise<{ ownerId?: string }>;
}) {
  const { ownerId } = await searchParams;

  const owners = await db.owner.findMany({
    orderBy: { lastName: "asc" },
    include: {
      properties: {
        include: {
          leases: {
            where: { status: "active" },
            include: { tenant: { select: { firstName: true, lastName: true } } },
          },
        },
      },
    },
  });

  // Only show owners who have active leases
  const ownersWithLeases = owners.filter((o) =>
    o.properties.some((p) => p.leases.length > 0)
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Pay Owner" description="Record an owner payout from the trust account" />
      <PayOwnerForm
        action={createOwnerPayout}
        owners={ownersWithLeases}
        defaultOwnerId={ownerId}
      />
    </div>
  );
}
