"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { readPendingEmail, clearPendingEmail } from "@/lib/auth/pending-email";
import { Header } from "@/components/layout/Header";

type Status = "working" | "need-email" | "error";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("working");
  const [error, setError] = useState("");
  const [emailInput, setEmailInput] = useState("");

  async function completeSignIn(email: string) {
    const authPromise = getFirebaseAuth();
    if (!authPromise) {
      setStatus("error");
      setError("Sign-in isn't configured yet. Please try again later.");
      return;
    }
    setStatus("working");
    try {
      const [auth, { signInWithEmailLink }] = await Promise.all([authPromise, import("firebase/auth")]);
      await signInWithEmailLink(auth, email, window.location.href);
      clearPendingEmail();
      router.replace("/studio");
    } catch {
      setStatus("error");
      setError("That sign-in link is invalid or has expired. Request a new one.");
    }
  }

  async function runCallbackFlow() {
    const authPromise = getFirebaseAuth();
    if (!isFirebaseConfigured || !authPromise) {
      setStatus("error");
      setError("Sign-in isn't configured yet. Please try again later.");
      return;
    }
    const [auth, { isSignInWithEmailLink }] = await Promise.all([authPromise, import("firebase/auth")]);
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      setStatus("error");
      setError("This isn't a valid sign-in link.");
      return;
    }
    const pendingEmail = readPendingEmail();
    if (pendingEmail) {
      await completeSignIn(pendingEmail);
    } else {
      // Link opened on a different device/browser than the one that requested it.
      setStatus("need-email");
    }
  }

  useEffect(() => {
    // One-time client-only flow: reads window.location/localStorage and calls
    // Firebase, none of which can run during SSR or be derived at render time.
    // Intentionally mount-only — runCallbackFlow is recreated each render but
    // must not re-trigger the flow.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void runCallbackFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (emailInput.indexOf("@") > 0) void completeSignIn(emailInput);
  }

  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm text-center">
          {status === "working" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-accent" />
              <p className="text-sm text-muted">Signing you in…</p>
            </div>
          )}

          {status === "need-email" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed text-muted">
                Confirm the email this sign-in link was sent to.
              </p>
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@brand.com"
                  aria-label="Email address"
                  className="rounded-full border border-border-strong bg-surface px-5 py-3 text-[14.5px] outline-none placeholder:text-dim"
                />
                <button
                  type="submit"
                  className="rounded-full bg-accent py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
                >
                  Continue
                </button>
              </form>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle size={28} className="text-accent" />
              <p className="text-sm leading-relaxed text-muted">{error}</p>
              <a
                href="/auth"
                className="mt-1 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
              >
                Back to sign in
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
