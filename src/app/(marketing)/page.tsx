import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HeroSignUpButton, HeroSignInButton, CtaSignUpButton } from "@/components/marketing/auth-buttons";
import { Building2, DollarSign, FileText, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

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

const perks = [
  "No credit card required",
  "Unlimited properties",
  "Free forever",
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Free for property managers
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Property management,
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text">made simple.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Free tools to manage your rental properties, track payments, and keep
            your trust accounts in order.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <HeroSignUpButton />
            <HeroSignInButton />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {perk}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold">
            Everything you need to manage rentals
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            From onboarding tenants to paying owners — one dashboard for your entire portfolio.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="rounded-2xl border bg-gradient-to-b from-card to-muted/30 p-10 sm:p-14 shadow-sm">
            <h2 className="text-3xl font-bold">Ready to simplify your rentals?</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Join property managers who trust Giddy Rents to keep things organized.
            </p>
            <div className="mt-8">
              <CtaSignUpButton />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required <span className="mx-1.5">·</span> Free forever
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
