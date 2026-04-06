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
import { Tenant, Property } from "@/generated/prisma/client";
import { format } from "date-fns";

interface LeaseFormProps {
  action: (formData: FormData) => void;
  tenants: Tenant[];
  properties: (Property & { owner: { firstName: string; lastName: string } })[];
  defaultValues?: {
    propertyId: string;
    tenantId: string;
    startDate: Date;
    endDate: Date | null;
    rentAmount: number;
    securityDeposit: number | null;
    status: string;
    notes: string | null;
  };
  submitLabel?: string;
}

const leaseStatuses = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "terminated", label: "Terminated" },
];

function formatDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function LeaseForm({
  action,
  tenants,
  properties,
  defaultValues,
  submitLabel = "Save",
}: LeaseFormProps) {
  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lease Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyId">Property *</Label>
              <Select name="propertyId" defaultValue={defaultValues?.propertyId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.owner.firstName} {p.owner.lastName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantId">Tenant *</Label>
              <Select name="tenantId" defaultValue={defaultValues?.tenantId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={defaultValues?.startDate ? formatDateInput(defaultValues.startDate) : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (leave blank for month-to-month)</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={defaultValues?.endDate ? formatDateInput(defaultValues.endDate) : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Monthly Rent *</Label>
              <Input
                id="rentAmount"
                name="rentAmount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaultValues?.rentAmount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Security Deposit</Label>
              <Input
                id="securityDeposit"
                name="securityDeposit"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaultValues?.securityDeposit ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={defaultValues?.status || "active"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leaseStatuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              defaultValue={defaultValues?.notes ?? ""}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
