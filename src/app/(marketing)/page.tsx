import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HeroSignUpButton, HeroSignInButton, CtaSignUpButton } from "@/components/marketing/auth-buttons";
import { Building2, DollarSign, FileText, Shield, CheckCircle2 } from "lucide-react";

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
  "No credit card",
  "No subscription fees",
  "Free forever",
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#000000] text-white">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 border-2 border-[#ECB84A]/30 bg-[#1C1C1C] px-4 py-1.5 text-sm text-[#ECB84A] mb-8" style={{ borderRadius: 4 }}>
            Brought to you by GIDDY DIGS
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Property management,
            <br />
            <span className="text-[#ECB84A]">made simple.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-[#a1a1aa] leading-relaxed">
            Manage your rental properties, track payments, and keep
            your trust accounts in order. Paid for by GIDDY DIGS. Free for you, always.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <HeroSignUpButton />
            <HeroSignInButton />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                {perk}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#0a0a0a] border-t-2 border-[#27272a] py-20 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold">
            Everything you need to manage rentals
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#a1a1aa]">
            From onboarding tenants to paying owners. One dashboard for your entire portfolio.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group border-2 border-[#27272a] bg-[#1C1C1C] p-6 transition-all hover:border-[#ECB84A]/40"
                  style={{ borderRadius: 4 }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center bg-[#ECB84A]/10 transition-colors group-hover:bg-[#ECB84A]/20"
                    style={{ borderRadius: 4 }}
                  >
                    <Icon className="h-6 w-6 text-[#ECB84A]" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-[#a1a1aa] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#000000] py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="border-2 border-[#27272a] bg-[#1C1C1C] p-10 sm:p-14" style={{ borderRadius: 4 }}>
            <h2 className="text-3xl font-extrabold">Ready to simplify your rentals?</h2>
            <p className="mt-3 text-lg text-[#a1a1aa]">
              Join property managers who trust Giddy Rents to keep things organized.
            </p>
            <div className="mt-8">
              <CtaSignUpButton />
            </div>
            <p className="mt-4 text-sm text-[#71717a]">
              Sponsored by GIDDY DIGS. No fees, no catches.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
