export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { OwnerDepositForm } from "@/components/trust/owner-deposit-form";
import { createOwnerDeposit } from "@/actions/trust";

export default async function OwnerDepositPage({
  searchParams,
}: {
  searchParams: Promise<{ ownerId?: string }>;
}) {
  const { ownerId } = await searchParams;

  const owners = await db.owner.findMany({
    orderBy: { lastName: "asc" },
    include: {
      properties: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Owner Deposit" description="Record money deposited by an owner into the trust account" />
      <OwnerDepositForm
        action={createOwnerDeposit}
        owners={owners}
        defaultOwnerId={ownerId}
      />
    </div>
  );
}
