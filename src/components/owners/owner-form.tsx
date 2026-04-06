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
import { Owner } from "@/generated/prisma/client";
import { useState } from "react";

interface OwnerFormProps {
  action: (formData: FormData) => void;
  defaultValues?: Owner;
  submitLabel?: string;
}

export function OwnerForm({ action, defaultValues, submitLabel = "Save" }: OwnerFormProps) {
  const [feeType, setFeeType] = useState(defaultValues?.feeType ?? "");

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={defaultValues?.firstName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={defaultValues?.lastName}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={defaultValues?.email ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={defaultValues?.phone ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={defaultValues?.address ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Management Fee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feeType">Fee Type</Label>
              <Select
                name="feeType"
                defaultValue={defaultValues?.feeType ?? ""}
                onValueChange={setFeeType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No fee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No fee</SelectItem>
                  <SelectItem value="flat">Flat Rate</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(feeType === "flat" || feeType === "percentage") && (
              <div className="space-y-2">
                <Label htmlFor="feeAmount">
                  {feeType === "flat" ? "Fee Amount ($)" : "Fee Percentage (%)"}
                </Label>
                <Input
                  id="feeAmount"
                  name="feeAmount"
                  type="number"
                  step={feeType === "percentage" ? "0.1" : "0.01"}
                  min="0"
                  defaultValue={defaultValues?.feeAmount ?? ""}
                  placeholder={feeType === "flat" ? "100.00" : "10"}
                />
              </div>
            )}
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
