"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { EmailSignInForm } from "@/components/auth/EmailSignInForm";
import { useAuth } from "@/lib/auth/AuthContext";

export default function AuthPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) router.replace("/");
  }, [loading, profile, router]);

  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-7 text-center">
            <h1 className="font-heading text-3xl font-bold tracking-tight">Sign in to ShootPX</h1>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              No password — we&apos;ll email you a one-time sign-in link.
            </p>
          </div>
          <EmailSignInForm />
        </div>
      </main>
    </>
  );
}
