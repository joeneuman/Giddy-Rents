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

type LeaseOption = {
  id: string;
  tenantId: string;
  securityDeposit: number | null;
  tenant: { firstName: string; lastName: string };
  property: { name: string };
};

interface SecurityDepositFormProps {
  action: (formData: FormData) => void;
  leases: LeaseOption[];
  defaultLeaseId?: string;
}

export function SecurityDepositForm({ action, leases, defaultLeaseId }: SecurityDepositFormProps) {
  const [selectedLeaseId, setSelectedLeaseId] = useState(defaultLeaseId || "");
  const selectedLease = leases.find((l) => l.id === selectedLeaseId);

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Deposit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Lease *</Label>
            <Select
              name="leaseId"
              defaultValue={defaultLeaseId}
              onValueChange={setSelectedLeaseId}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type *</Label>
              <Select name="type" defaultValue="deposit" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit Received</SelectItem>
                  <SelectItem value="refund">Deposit Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={selectedLease?.securityDeposit ?? ""}
                key={selectedLeaseId}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={today}
                required
              />
            </div>
          </div>
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

      <Button type="submit">Record Security Deposit</Button>
    </form>
  );
}
