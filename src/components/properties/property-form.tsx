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
import { Property, Owner } from "@/generated/prisma/client";
import { useState } from "react";

interface PropertyFormProps {
  action: (formData: FormData) => void;
  owners: Owner[];
  defaultValues?: Property;
  submitLabel?: string;
}

const propertyTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

export function PropertyForm({
  action,
  owners,
  defaultValues,
  submitLabel = "Save",
}: PropertyFormProps) {
  const [feeType, setFeeType] = useState(defaultValues?.feeType ?? "");

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. 123 Main St - Unit A"
              defaultValue={defaultValues?.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              name="address"
              defaultValue={defaultValues?.address}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                defaultValue={defaultValues?.city}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                defaultValue={defaultValues?.state}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                name="zip"
                defaultValue={defaultValues?.zip}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select name="type" defaultValue={defaultValues?.type || "apartment"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Proposed Rent *</Label>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                defaultValue={defaultValues?.bedrooms ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                step="0.5"
                defaultValue={defaultValues?.bathrooms ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sqft">Square Feet</Label>
              <Input
                id="sqft"
                name="sqft"
                type="number"
                min="0"
                defaultValue={defaultValues?.sqft ?? ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Owner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ownerId">Property Owner *</Label>
            <Select name="ownerId" defaultValue={defaultValues?.ownerId} required>
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
