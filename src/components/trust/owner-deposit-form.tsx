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

type OwnerWithProperties = {
  id: string;
  firstName: string;
  lastName: string;
  properties: { id: string; name: string }[];
};

interface OwnerDepositFormProps {
  action: (formData: FormData) => void;
  owners: OwnerWithProperties[];
  defaultOwnerId?: string;
}

export function OwnerDepositForm({ action, owners, defaultOwnerId }: OwnerDepositFormProps) {
  const [selectedOwnerId, setSelectedOwnerId] = useState(defaultOwnerId || "");
  const selectedOwner = owners.find((o) => o.id === selectedOwnerId);

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Owner Deposit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Owner *</Label>
            <Select
              name="ownerId"
              defaultValue={defaultOwnerId}
              onValueChange={setSelectedOwnerId}
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

          {selectedOwner && selectedOwner.properties.length > 0 && (
            <div className="space-y-2">
              <Label>Property (optional)</Label>
              <Select name="propertyId">
                <SelectTrigger>
                  <SelectValue placeholder="General deposit (no property)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General deposit</SelectItem>
                  {selectedOwner.properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
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
            <Textarea id="notes" name="notes" rows={2} placeholder="e.g. Repair reserve deposit" />
          </div>
        </CardContent>
      </Card>

      <Button type="submit">Record Owner Deposit</Button>
    </form>
  );
}
