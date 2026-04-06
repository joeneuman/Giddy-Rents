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
import { Lease, Tenant, Property } from "@/generated/prisma/client";
import { useState } from "react";
import { format } from "date-fns";

type LeaseWithRelations = Lease & {
  tenant: Tenant;
  property: Property;
};

interface PaymentFormProps {
  action: (formData: FormData) => void;
  leases: LeaseWithRelations[];
  defaultLeaseId?: string;
  submitLabel?: string;
}

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "venmo", label: "Venmo" },
  { value: "zelle", label: "Zelle" },
  { value: "other", label: "Other" },
];

export function PaymentForm({
  action,
  leases,
  defaultLeaseId,
  submitLabel = "Record Payment",
}: PaymentFormProps) {
  const [selectedLeaseId, setSelectedLeaseId] = useState(defaultLeaseId || "");
  const selectedLease = leases.find((l) => l.id === selectedLeaseId);

  const today = format(new Date(), "yyyy-MM-dd");
  const firstOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");
  const lastOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd");

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leaseId">Lease *</Label>
            <Select
              name="leaseId"
              defaultValue={defaultLeaseId}
              onValueChange={(val) => setSelectedLeaseId(val ?? "")}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a lease" />
              </SelectTrigger>
              <SelectContent>
                {leases.map((lease) => (
                  <SelectItem key={lease.id} value={lease.id}>
                    {lease.property.name} — {lease.tenant.firstName} {lease.tenant.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <input type="hidden" name="tenantId" value={selectedLease?.tenantId || ""} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={selectedLease?.rentAmount}
                key={selectedLeaseId}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="datePaid">Date Paid *</Label>
              <Input
                id="datePaid"
                name="datePaid"
                type="date"
                defaultValue={today}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodStart">Period Start *</Label>
              <Input
                id="periodStart"
                name="periodStart"
                type="date"
                defaultValue={firstOfMonth}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Period End *</Label>
              <Input
                id="periodEnd"
                name="periodEnd"
                type="date"
                defaultValue={lastOfMonth}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
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
              <Label htmlFor="referenceNumber">Reference # (check number, transaction ID)</Label>
              <Input
                id="referenceNumber"
                name="referenceNumber"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
