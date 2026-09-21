"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

export function HeaderAuthArea() {
  const { profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (loading || !profile) {
    return (
      <Link
        href="/auth"
        className="whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
      >
        Get started
      </Link>
    );
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-[160px] truncate text-sm text-muted sm:inline">
        {profile.name || profile.email}
      </span>
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border-strong px-4 py-2.5 text-sm font-medium text-muted hover:border-text hover:text-text disabled:opacity-60"
      >
        <LogOut size={14} />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
