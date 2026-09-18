"use client";

import { useState, type FormEvent } from "react";
import { FcGoogle } from "react-icons/fc";
import { sendAuthMail } from "@/lib/api/auth";
import { signInWithGoogle } from "@/lib/auth/google-sign-in";
import { savePendingEmail } from "@/lib/auth/pending-email";

type EmailStatus = "idle" | "sending" | "sent";

export function AuthCard() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<EmailStatus>("idle");
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // AuthContext's onAuthStateChanged listener picks up the signed-in
      // user and syncs the profile — nothing else to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || trimmed.indexOf("@") < 1 || trimmed.indexOf(".") < 0) {
      setError("Enter a valid email address.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const continueUrl = `${window.location.origin}/auth/callback`;
      await sendAuthMail(trimmed, continueUrl);
      savePendingEmail(trimmed);
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  function reset() {
    setStatus("idle");
    setEmail("");
    setError("");
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7">
      <h1 className="text-center text-[25px] font-semibold tracking-tight">Get started</h1>

      {status === "sent" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 rounded-xl border border-accent p-4">
            <span className="font-mono text-[11px] tracking-wide text-accent">✓ MAGIC LINK SENT</span>
            <span className="text-[13.5px] leading-relaxed text-muted">
              We emailed a sign-in link to <b className="text-text">{email}</b>. It expires in 15
              minutes.
            </span>
          </div>
          <button onClick={reset} className="text-center text-[13px] text-dim hover:text-accent">
            Use a different email
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-border-strong bg-surface-2 py-3.5 text-[14.5px] font-medium hover:border-text hover:bg-bg-alt disabled:opacity-60"
          >
            <FcGoogle size={18} />
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3.5">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10.5px] tracking-widest text-dim">OR</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2.5">
            <label htmlFor="auth-email" className="font-mono text-[10.5px] tracking-wide text-dim">
              EMAIL
            </label>
            <div className="rounded-xl border border-border-strong bg-bg-alt px-4 py-3.5">
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@brand.com"
                className="w-full bg-transparent text-[14.5px] outline-none placeholder:text-dim"
              />
            </div>
            {error && <span className="text-xs text-[#ff8a6b]">{error}</span>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-1.5 rounded-xl bg-accent py-3.5 text-[14.5px] font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Continue with email"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
