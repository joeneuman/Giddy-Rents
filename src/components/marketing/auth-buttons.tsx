"use client";

import { SignUpButton, SignInButton } from "@clerk/nextjs";

export function HeroSignUpButton() {
  return (
    <SignUpButton mode="modal">
      <button
        className="bg-[#ECB84A] text-black px-8 py-3.5 text-sm font-bold cursor-pointer transition-all hover:bg-[#f5c76a] active:scale-95"
        style={{ borderRadius: 4 }}
      >
        Get started
      </button>
    </SignUpButton>
  );
}

export function HeroSignInButton() {
  return (
    <SignInButton mode="modal">
      <button
        className="border-2 border-[#3f3f46] text-white px-8 py-3.5 text-sm font-bold cursor-pointer transition-all hover:border-[#ECB84A]/50 hover:text-[#ECB84A] active:scale-95"
        style={{ borderRadius: 4 }}
      >
        Sign in
      </button>
    </SignInButton>
  );
}

export function CtaSignUpButton() {
  return (
    <SignUpButton mode="modal">
      <button
        className="bg-[#ECB84A] text-black px-10 py-4 text-base font-bold cursor-pointer transition-all hover:bg-[#f5c76a] active:scale-95"
        style={{ borderRadius: 4 }}
      >
        Create your account
      </button>
    </SignUpButton>
  );
}

export function NavSignInButton() {
  return (
    <SignInButton mode="modal">
      <button className="text-sm font-medium text-[#a1a1aa] cursor-pointer transition-colors hover:text-white">
        Sign in
      </button>
    </SignInButton>
  );
}

export function NavSignUpButton() {
  return (
    <SignUpButton mode="modal">
      <button
        className="bg-[#ECB84A] text-black px-4 py-2 text-sm font-bold cursor-pointer transition-all hover:bg-[#f5c76a] active:scale-95"
        style={{ borderRadius: 4 }}
      >
        Sign up
      </button>
    </SignUpButton>
  );
}
