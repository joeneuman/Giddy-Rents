import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Home,
  Users,
  FileText,
  DollarSign,
  Check,
  Lock,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

interface StepData {
  number: number;
  title: string;
  icon: LucideIcon;
  count: number;
  countLabel: string;
  href: string;
  actionLabel: string;
  status: "completed" | "current" | "locked";
}

interface SetupFlowProps {
  ownerCount: number;
  propertyCount: number;
  tenantCount: number;
  activeLeaseCount: number;
  paymentCount: number;
}

export function SetupFlow({
  ownerCount,
  propertyCount,
  tenantCount,
  activeLeaseCount,
  paymentCount,
}: SetupFlowProps) {
  const allComplete = activeLeaseCount > 0 && paymentCount > 0;

  function getStatus(stepNum: number): "completed" | "current" | "locked" {
    switch (stepNum) {
      case 1: // Add Owner
        return ownerCount > 0 ? "completed" : "current";
      case 2: // Add Property
        if (propertyCount > 0) return "completed";
        return ownerCount > 0 ? "current" : "locked";
      case 3: // Add Tenant
        return tenantCount > 0 ? "completed" : "current";
      case 4: // Create Lease
        if (activeLeaseCount > 0) return "completed";
        return propertyCount > 0 && tenantCount > 0 ? "current" : "locked";
      case 5: // Record Payment
        if (paymentCount > 0) return "completed";
        return activeLeaseCount > 0 ? "current" : "locked";
      default:
        return "locked";
    }
  }

  const steps: StepData[] = [
    {
      number: 1,
      title: "Add Owner",
      icon: Building2,
      count: ownerCount,
      countLabel: ownerCount === 1 ? "owner" : "owners",
      href: "/owners/new",
      actionLabel: "Add Owner",
      status: getStatus(1),
    },
    {
      number: 2,
      title: "Add Property",
      icon: Home,
      count: propertyCount,
      countLabel: propertyCount === 1 ? "property" : "properties",
      href: "/properties/new",
      actionLabel: "Add Property",
      status: getStatus(2),
    },
    {
      number: 3,
      title: "Add Tenant",
      icon: Users,
      count: tenantCount,
      countLabel: tenantCount === 1 ? "tenant" : "tenants",
      href: "/tenants/new",
      actionLabel: "Add Tenant",
      status: getStatus(3),
    },
    {
      number: 4,
      title: "Create Lease",
      icon: FileText,
      count: activeLeaseCount,
      countLabel: activeLeaseCount === 1 ? "lease" : "leases",
      href: "/leases/new",
      actionLabel: "Create Lease",
      status: getStatus(4),
    },
    {
      number: 5,
      title: "Record Payment",
      icon: DollarSign,
      count: paymentCount,
      countLabel: paymentCount === 1 ? "payment" : "payments",
      href: "/payments/new",
      actionLabel: "Record Payment",
      status: getStatus(5),
    },
  ];

  if (allComplete) {
    // Compact completed view
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center gap-2">
              <Link
                href={step.href.replace("/new", "")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span>{step.title}</span>
                <span className="text-xs text-muted-foreground/70">({step.count})</span>
              </Link>
              {i < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full setup view
  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-1">Getting Started</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Follow these steps to set up your first rental
      </p>

      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-start justify-between gap-2">
        {steps.map((step, i) => (
          <div key={step.number} className="flex items-start flex-1">
            <StepCard step={step} />
            {i < steps.length - 1 && (
              <div className="flex items-center pt-8 px-1">
                <ChevronRight
                  className={cn(
                    "h-5 w-5 shrink-0",
                    step.status === "completed"
                      ? "text-green-400"
                      : "text-muted-foreground/20"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-3 md:hidden">
        {steps.map((step) => (
          <StepCard key={step.number} step={step} />
        ))}
      </div>
    </div>
  );
}

function StepCard({ step }: { step: StepData }) {
  const Icon = step.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center p-4 rounded-lg flex-1 min-w-0 transition-colors",
        "md:flex-col",
        // Mobile: horizontal layout
        "flex-row md:flex-col gap-3 md:gap-2",
        step.status === "current" && "bg-primary/5 ring-1 ring-primary/20",
        step.status === "locked" && "opacity-50"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          step.status === "completed" && "bg-green-100 text-green-600",
          step.status === "current" && "bg-primary text-primary-foreground",
          step.status === "locked" && "bg-muted text-muted-foreground"
        )}
      >
        {step.status === "completed" ? (
          <Check className="h-6 w-6" />
        ) : step.status === "locked" ? (
          <Lock className="h-5 w-5" />
        ) : (
          <Icon className="h-6 w-6" />
        )}
      </div>

      <div className="flex flex-col items-center md:items-center flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            step.status === "locked" && "text-muted-foreground"
          )}
        >
          {step.title}
        </p>

        {step.status === "completed" && (
          <p className="text-xs text-green-600 mt-0.5">
            {step.count} {step.countLabel}
          </p>
        )}

        {step.status === "current" && (
          <Button asChild size="sm" className="mt-2">
            <Link href={step.href}>{step.actionLabel}</Link>
          </Button>
        )}

        {step.status === "locked" && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Complete previous steps
          </p>
        )}
      </div>
    </div>
  );
}
