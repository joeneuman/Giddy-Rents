"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Banknote, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface OwnerPayoutRowProps {
  action: (formData: FormData) => void;
  ownerId: string;
  ownerName: string;
  leaseId: string;
  propertyName: string;
  rentCollected: number;
  fee: number;
  netPayout: number;
  feeLabel: string;
  alreadyPaid: boolean;
}

export function OwnerPayoutRow({
  action,
  ownerId,
  ownerName,
  leaseId,
  propertyName,
  rentCollected,
  fee,
  netPayout,
  feeLabel,
  alreadyPaid,
}: OwnerPayoutRowProps) {
  const [open, setOpen] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  if (alreadyPaid) {
    return (
      <Button size="sm" variant="outline" disabled>
        <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
        Paid
      </Button>
    );
  }

  if (rentCollected <= 0) {
    return (
      <Button size="sm" variant="outline" disabled>
        Awaiting Rent
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Banknote className="h-4 w-4 mr-1" />
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Owner</DialogTitle>
          <DialogDescription>
            {ownerName} — {propertyName}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Rent Collected</span>
            <span>${rentCollected.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Management Fee {feeLabel}</span>
            <span className="text-red-600">-${fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Net Payout</span>
            <span className="text-green-600">${netPayout.toFixed(2)}</span>
          </div>
        </div>
        <form action={action} className="space-y-4">
          <input type="hidden" name="ownerId" value={ownerId} />
          <input type="hidden" name="leaseId" value={leaseId} />
          <input type="hidden" name="amount" value={rentCollected.toFixed(2)} />
          <div className="space-y-2">
            <label className="text-sm font-medium">Payout Date</label>
            <Input name="date" type="date" defaultValue={today} required />
          </div>
          <Button type="submit" className="w-full">
            Pay ${netPayout.toFixed(2)} to {ownerName}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
