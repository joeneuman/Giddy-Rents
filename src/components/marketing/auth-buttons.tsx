"use client";

import { SignUpButton, SignInButton } from "@clerk/nextjs";

export function HeroSignUpButton() {
  return (
    <SignUpButton mode="modal">
      <button className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg cursor-pointer transition-all hover:bg-primary/85 hover:shadow-xl hover:scale-105 active:scale-100">
        Get started free
      </button>
    </SignUpButton>
  );
}

export function HeroSignInButton() {
  return (
    <SignInButton mode="modal">
      <button className="rounded-xl border-2 border-primary/20 px-8 py-3.5 text-sm font-semibold cursor-pointer transition-all hover:border-primary/40 hover:bg-accent hover:scale-105 active:scale-100">
        Sign in
      </button>
    </SignInButton>
  );
}

export function CtaSignUpButton() {
  return (
    <SignUpButton mode="modal">
      <button className="rounded-xl bg-primary px-10 py-4 text-base font-semibold text-primary-foreground shadow-lg cursor-pointer transition-all hover:bg-primary/85 hover:shadow-xl hover:scale-105 active:scale-100">
        Create your free account
      </button>
    </SignUpButton>
  );
}

export function NavSignInButton() {
  return (
    <SignInButton mode="modal">
      <button className="text-sm font-medium text-muted-foreground cursor-pointer transition-colors hover:text-foreground">
        Sign in
      </button>
    </SignInButton>
  );
}

export function NavSignUpButton() {
  return (
    <SignUpButton mode="modal">
      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground cursor-pointer transition-all hover:bg-primary/85 hover:scale-105 active:scale-100">
        Sign up free
      </button>
    </SignUpButton>
  );
}
