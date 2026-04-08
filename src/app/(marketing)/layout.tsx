import Link from "next/link";
import Image from "next/image";
import { Show, UserButton } from "@clerk/nextjs";
import { NavSignInButton, NavSignUpButton } from "@/components/marketing/auth-buttons";
import { Home } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b-2 border-[#27272a] bg-[#000000] sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <Home className="h-5 w-5 text-[#ECB84A]" />
            Giddy Rents
          </Link>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <NavSignInButton />
              <NavSignUpButton />
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="bg-[#ECB84A] text-black px-4 py-2 text-sm font-bold transition-all hover:bg-[#f5c76a] active:scale-95 cursor-pointer"
                style={{ borderRadius: 4 }}
              >
                Dashboard
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t-2 border-[#27272a] bg-[#000000] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col items-center gap-3 text-sm text-[#71717a]">
          <p>Powered by</p>
          <a
            href="https://giddydigs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/giddy-digs-logo.png"
              alt="GIDDY DIGS"
              width={180}
              height={45}
              style={{ width: 180, height: "auto" }}
            />
          </a>
        </div>
      </footer>
    </>
  );
}
