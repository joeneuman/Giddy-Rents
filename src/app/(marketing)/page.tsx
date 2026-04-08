import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { Building2, DollarSign, FileText, Shield } from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Property Management",
    description: "Track owners, properties, tenants, and leases in one place.",
  },
  {
    icon: DollarSign,
    title: "Rent Collection",
    description: "Monthly cycle workflows to collect rent and pay owners.",
  },
  {
    icon: Shield,
    title: "Trust Accounting",
    description: "Full trust account ledger with deposits, payouts, and security deposits.",
  },
  {
    icon: FileText,
    title: "Contracts & Documents",
    description: "Upload and manage lease contracts and important documents.",
  },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Property management,
          <br />
          <span className="text-primary">made simple.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Free tools to manage your rental properties, track payments, and keep
          your trust accounts in order.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <SignUpButton mode="modal" />
          <SignInButton mode="modal" />
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold">
            Everything you need to manage rentals
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-lg border bg-card p-6">
                  <Icon className="h-8 w-8 text-primary" />
                  <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold">Ready to simplify your rentals?</h2>
          <p className="mt-2 text-muted-foreground">
            No credit card required. Free forever.
          </p>
          <div className="mt-6">
            <SignUpButton mode="modal" />
          </div>
        </div>
      </section>
    </div>
  );
}
