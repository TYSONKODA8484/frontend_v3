"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { SIGNUP_CREDITS, SIGNUP_CREDITS_NOTE } from "@/lib/config/site";

export function CtaSignup() {
  const [email, setEmail] = useState("");
  const [signedUp, setSignedUp] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function signUp() {
    if (sending) return;
    if (!email || email.indexOf("@") < 1) return setError("Enter a valid email address.");
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) setError(data.error ?? "Couldn't save your email. Please try again.");
      else setSignedUp(true);
    } catch {
      setError("Couldn't save your email. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="start" aria-label="Get started" className="relative overflow-hidden border-t border-border">
      <div className="pointer-events-none absolute bottom-[-260px] left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(200,255,0,0.15),transparent)]" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 px-5 py-20 text-center">
        <h2 className="max-w-[20ch] font-heading text-[clamp(32px,4.4vw,56px)] font-bold leading-[1.03] tracking-tight">
          Your next shoot starts with one photo.
        </h2>
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[12px] tracking-wide text-muted">
            {SIGNUP_CREDITS} FREE CREDITS ON SIGNUP*
          </span>
          <span className="text-[11px] text-dim">*{SIGNUP_CREDITS_NOTE}</span>
        </div>

        {signedUp ? (
          <div className="flex items-center gap-2 rounded-full border border-accent px-6 py-3 font-mono text-[13px] text-accent">
            <CheckCircle2 size={16} />
            YOU&apos;RE ON THE LIST
          </div>
        ) : (
          <div className="flex w-full max-w-[440px] items-center gap-2 rounded-full border border-border-strong bg-surface p-1.5 pl-5">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && signUp()}
              placeholder="you@brand.com"
              aria-label="Work email"
              className="min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-dim"
            />
            <button
              onClick={signUp}
              disabled={sending}
              className="whitespace-nowrap rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
            >
              {sending ? "Sending…" : "Join the list"}
            </button>
          </div>
        )}
        {error && <p className="text-[13px] text-[#ff8a6b]">{error}</p>}
      </div>
    </section>
  );
}
