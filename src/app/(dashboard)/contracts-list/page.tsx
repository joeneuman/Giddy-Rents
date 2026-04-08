export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { fullName, formatRelativeDate } from "@/lib/format";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default async function ContractsListPage() {
  const userId = await getUserId();
  const contracts = await db.contract.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    include: {
      lease: {
        include: {
          tenant: true,
          property: { include: { owner: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="All uploaded lease contracts"
      />

      {contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No contracts yet"
          description="Upload contracts from a lease detail page."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="font-medium text-sm">{contract.fileName}</p>
                        {contract.description && (
                          <p className="text-xs text-muted-foreground">{contract.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/properties/${contract.lease.property.id}`}
                      className="hover:underline"
                    >
                      {contract.lease.property.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/owners/${contract.lease.property.owner.id}`}
                      className="hover:underline"
                    >
                      {fullName(contract.lease.property.owner.firstName, contract.lease.property.owner.lastName)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/tenants/${contract.lease.tenant.id}`}
                      className="hover:underline"
                    >
                      {fullName(contract.lease.tenant.firstName, contract.lease.tenant.lastName)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatFileSize(contract.fileSize)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatRelativeDate(contract.uploadedAt)}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon">
                      <a href={`/contracts/${contract.id}`} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
