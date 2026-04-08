import Link from "next/link";
import Image from "next/image";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Home } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Home className="h-5 w-5 text-primary" />
            Giddy Rents
          </Link>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal" />
              <SignUpButton mode="modal" />
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Dashboard
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t bg-card py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
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
