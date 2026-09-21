"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { TeamProvider } from "@/lib/studio/TeamContext";
import { TeamBillingProvider } from "@/lib/studio/TeamBillingContext";
import { ToastProvider } from "@/lib/studio/ToastContext";
import { Sidebar } from "@/components/studio/Sidebar";
import { Navbar } from "@/components/studio/Navbar";
import { Toast } from "@/components/studio/Toast";
import { BuyCreditsModal } from "@/components/studio/BuyCreditsModal";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) router.replace("/auth");
  }, [loading, firebaseUser, router]);

  // Only gates on Firebase resolving sign-in state, not on the backend
  // profile fetch — the shell (and its team/billing fetches) can start as
  // soon as we know the visitor is signed in, instead of waiting on an
  // extra serial round trip to /me first.
  if (loading || !firebaseUser) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-dim">Loading…</div>;
  }

  return (
    <TeamProvider>
      <TeamBillingProvider>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Navbar />
              <div className="flex-1 overflow-auto">{children}</div>
            </div>
          </div>
          <BuyCreditsModal />
          <Toast />
        </ToastProvider>
      </TeamBillingProvider>
    </TeamProvider>
  );
}
