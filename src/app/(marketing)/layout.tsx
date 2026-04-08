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
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Home className="h-5 w-5 text-primary" />
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
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/85 hover:scale-105 active:scale-100 cursor-pointer"
              >
                Dashboard
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t bg-card py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <p>Powered by</p>
          <a
            href="https://giddydigs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/giddy-digs-logo.png"
              alt="Giddy Digs"
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
