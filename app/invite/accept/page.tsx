"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { acceptInvite } from "@/lib/api/teams";
import { ApiError } from "@/lib/api/authed-fetch";
import { Header } from "@/components/layout/Header";

type Status = "working" | "error" | "success";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("working");
  const [error, setError] = useState("");

  async function run() {
    const token = searchParams.get("invite_token");
    const email = searchParams.get("invite_email");

    if (!token) {
      setStatus("error");
      setError("This invite link is missing its token.");
      return;
    }
    if (!isFirebaseConfigured || !auth) {
      setStatus("error");
      setError("Sign-in isn't configured yet. Please try again later.");
      return;
    }

    try {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        if (!email) {
          setStatus("error");
          setError("This invite link is missing the email it was sent to.");
          return;
        }
        await signInWithEmailLink(auth, email, window.location.href);
      } else if (!auth.currentUser) {
        setStatus("error");
        setError("Sign in first, then open this invite link again.");
        return;
      }

      await acceptInvite(token);
      setStatus("success");
      setTimeout(() => router.replace("/studio"), 1500);
    } catch (err) {
      setStatus("error");
      if (err instanceof ApiError && err.status === 409) {
        setError("That team is already full.");
      } else if (err instanceof ApiError && err.status === 400) {
        setError("This invite link is invalid or has expired.");
      } else {
        setError("Couldn't accept the invite. Please try again.");
      }
    }
  }

  useEffect(() => {
    // One-time client-only flow: reads window.location/query params and calls
    // Firebase + the backend, none of which can run during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm text-center">
          {status === "working" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-sm text-muted">Joining the team…</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 size={28} className="text-accent" />
              <p className="text-sm text-muted">You&apos;re in! Redirecting…</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle size={28} className="text-accent" />
              <p className="text-sm leading-relaxed text-muted">{error}</p>
              <a
                href="/studio"
                className="mt-1 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
              >
                Go to Studio
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteContent />
    </Suspense>
  );
}
