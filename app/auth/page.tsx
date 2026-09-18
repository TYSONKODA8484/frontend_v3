"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/lib/auth/AuthContext";

export default function AuthPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) router.replace("/studio");
  }, [loading, profile, router]);

  return (
    <div className="flex min-h-screen">
      <AuthShowcase />

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-8 py-10 lg:w-[520px] lg:flex-none">
        <div className="animate-glow pointer-events-none absolute -right-40 -top-36 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(200,255,0,0.14),transparent)]" />

        <div className="relative flex w-full max-w-sm flex-col gap-6">
          <Link href="/" className="mb-1 flex justify-center lg:hidden">
            <Logo />
          </Link>

          <AuthCard />

          <p className="text-center text-[11.5px] leading-relaxed text-dim">
            By continuing you agree to the{" "}
            <Link href="/terms" className="text-accent hover:text-accent-hover">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-accent hover:text-accent-hover">
              Privacy Policy
            </Link>
            .
          </p>

          <Link href="/" className="text-center text-[13px] text-dim hover:text-accent">
            ← Back to shootpx.com
          </Link>
        </div>
      </div>
    </div>
  );
}
