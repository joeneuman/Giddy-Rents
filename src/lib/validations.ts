import { z } from "zod/v4";

export const ownerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const tenantSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
  notes: z.string().optional(),
});

export const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  type: z.string().default("apartment"),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  sqft: z.coerce.number().int().min(0).optional(),
  rentAmount: z.coerce.number().min(0, "Rent amount must be positive"),
  ownerId: z.string().min(1, "Owner is required"),
  notes: z.string().optional(),
});

export const leaseSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  rentAmount: z.coerce.number().min(0, "Rent amount must be positive"),
  securityDeposit: z.coerce.number().min(0).optional(),
  status: z.string().default("active"),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  leaseId: z.string().min(1, "Lease is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  datePaid: z.string().min(1, "Payment date is required"),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  method: z.string().min(1, "Payment method is required"),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type OwnerInput = z.infer<typeof ownerSchema>;
export type TenantInput = z.infer<typeof tenantSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type LeaseInput = z.infer<typeof leaseSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
