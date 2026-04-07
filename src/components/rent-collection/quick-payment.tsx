"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "deposit", label: "Deposit" },
  { value: "direct_deposit", label: "Direct Deposit" },
  { value: "venmo", label: "Venmo" },
  { value: "zelle", label: "Zelle" },
  { value: "other", label: "Other" },
];

interface QuickPaymentProps {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  leaseId: string;
  tenantId: string;
  tenantName: string;
  propertyName: string;
  runningBalance: number;
  rentAmount: number;
}

export function QuickPayment({
  action,
  leaseId,
  tenantId,
  tenantName,
  propertyName,
  runningBalance,
  rentAmount,
}: QuickPaymentProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const today = format(new Date(), "yyyy-MM-dd");
  const firstOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
  const lastOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("leaseId", leaseId);
    formData.append("tenantId", tenantId);
    formData.append("periodStart", firstOfMonth);
    formData.append("periodEnd", lastOfMonth);

    startTransition(async () => {
      try {
        await action(formData);
      } catch {
        // redirect throws — expected
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={runningBalance > 0 ? "default" : "outline"}>
          <DollarSign className="h-4 w-4 mr-1" />
          {runningBalance > 0 ? "Collect" : "Record"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {tenantName} — {propertyName} — ${rentAmount.toFixed(2)}/mo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`amount-${leaseId}`}>Amount</Label>
              <Input
                id={`amount-${leaseId}`}
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={runningBalance > 0 ? runningBalance.toFixed(2) : rentAmount.toFixed(2)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`date-${leaseId}`}>Date</Label>
              <Input
                id={`date-${leaseId}`}
                name="datePaid"
                type="date"
                defaultValue={today}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`method-${leaseId}`}>Method</Label>
              <Select name="method" defaultValue="check" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`ref-${leaseId}`}>Reference #</Label>
              <Input id={`ref-${leaseId}`} name="referenceNumber" />
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Recording..." : "Record Payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
