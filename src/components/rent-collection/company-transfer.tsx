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
import { ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface CompanyTransferProps {
  action: (formData: FormData) => void;
  amount: number;
}

export function CompanyTransfer({ action, amount }: CompanyTransferProps) {
  const [open, setOpen] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ArrowRightLeft className="h-4 w-4 mr-1" />
          Transfer ${amount.toFixed(2)} to Operating
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer to Operating Account</DialogTitle>
          <DialogDescription>
            Move accumulated management fees from trust to your operating account.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between text-sm font-bold">
              <span>Transfer Amount</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
          <input type="hidden" name="amount" value={amount.toFixed(2)} />
          <div className="space-y-2">
            <label className="text-sm font-medium">Transfer Date</label>
            <Input name="date" type="date" defaultValue={today} required />
          </div>
          <Button type="submit" className="w-full">
            Confirm Transfer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
