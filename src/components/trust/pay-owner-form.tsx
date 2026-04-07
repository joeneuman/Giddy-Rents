"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { format } from "date-fns";

type OwnerWithLeases = {
  id: string;
  firstName: string;
  lastName: string;
  properties: {
    id: string;
    name: string;
    feeType: string | null;
    feeAmount: number | null;
    leases: {
      id: string;
      rentAmount: number;
      tenant: { firstName: string; lastName: string };
    }[];
  }[];
};

interface PayOwnerFormProps {
  action: (formData: FormData) => void;
  owners: OwnerWithLeases[];
  defaultOwnerId?: string;
}

export function PayOwnerForm({ action, owners, defaultOwnerId }: PayOwnerFormProps) {
  const [selectedOwnerId, setSelectedOwnerId] = useState(defaultOwnerId || "");
  const [selectedLeaseId, setSelectedLeaseId] = useState("");

  const selectedOwner = owners.find((o) => o.id === selectedOwnerId);
  const leases = selectedOwner?.properties.flatMap((p) =>
    p.leases.map((l) => ({ ...l, propertyName: p.name, feeType: p.feeType, feeAmount: p.feeAmount }))
  ) || [];
  const selectedLease = leases.find((l) => l.id === selectedLeaseId);

  const rentAmount = selectedLease?.rentAmount ?? 0;
  const fee = selectedLease
    ? selectedLease.feeType === "flat"
      ? selectedLease.feeAmount ?? 0
      : selectedLease.feeType === "percentage"
        ? Math.round(rentAmount * (selectedLease.feeAmount ?? 0)) / 100
        : 0
    : 0;
  const netPayout = rentAmount - fee;

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Owner *</Label>
            <Select
              name="ownerId"
              defaultValue={defaultOwnerId}
              onValueChange={(val) => { setSelectedOwnerId(val); setSelectedLeaseId(""); }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an owner" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.firstName} {owner.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Lease / Property *</Label>
            <Select
              name="leaseId"
              onValueChange={setSelectedLeaseId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a lease" />
              </SelectTrigger>
              <SelectContent>
                {leases.map((lease) => (
                  <SelectItem key={lease.id} value={lease.id}>
                    {lease.propertyName} — {lease.tenant.firstName} {lease.tenant.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Rent Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={rentAmount || ""}
                readOnly
                key={selectedLeaseId}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Payout Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={today}
                required
              />
            </div>
          </div>

          {selectedOwner && selectedLease && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rent Amount</span>
                <span>{rentAmount > 0 ? `$${rentAmount.toFixed(2)}` : "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>
                  Management Fee
                  {selectedLease.feeType === "percentage"
                    ? ` (${selectedLease.feeAmount}%)`
                    : selectedLease.feeType === "flat"
                      ? " (flat)"
                      : ""}
                </span>
                <span className="text-red-600">-${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2">
                <span>Net Payout to Owner</span>
                <span className="text-green-600">${netPayout.toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit">Record Payout</Button>
    </form>
  );
}
