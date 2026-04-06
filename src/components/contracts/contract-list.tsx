"use client";

import { Contract } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2 } from "lucide-react";
import { formatRelativeDate } from "@/lib/format";
import { deleteContract } from "@/actions/contracts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function ContractList({ contracts }: { contracts: Contract[] }) {
  const router = useRouter();

  if (contracts.length === 0) {
    return <p className="text-sm text-muted-foreground">No contracts uploaded.</p>;
  }

  const handleDelete = async (contractId: string, leaseId: string) => {
    await deleteContract(contractId, leaseId);
    toast.success("Contract deleted");
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {contracts.map((contract) => (
        <div
          key={contract.id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium">{contract.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(contract.fileSize)} — {formatRelativeDate(contract.uploadedAt)}
                {contract.description && ` — ${contract.description}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon">
              <a href={`/contracts/${contract.id}`} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDelete(contract.id, contract.leaseId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
