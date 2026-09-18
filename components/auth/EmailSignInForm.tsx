"use client";

import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { sendAuthMail } from "@/lib/api/auth";
import { savePendingEmail } from "@/lib/auth/pending-email";

type Status = "idle" | "sending" | "sent" | "error";

export function EmailSignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || email.indexOf("@") < 1) {
      setError("Enter a valid email address.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const continueUrl = `${window.location.origin}/auth/callback`;
      await sendAuthMail(email, continueUrl);
      savePendingEmail(email);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent bg-surface p-7 text-center">
        <CheckCircle2 size={28} className="text-accent" />
        <p className="text-[15px] font-semibold">Check your email</p>
        <p className="text-sm leading-relaxed text-muted">
          We sent a sign-in link to <span className="text-text">{email}</span>. Open it on this
          device to finish signing in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-full border border-border-strong bg-surface p-1.5 pl-5">
        <Mail size={16} className="flex-none text-dim" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@brand.com"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent px-2 text-[14.5px] outline-none placeholder:text-dim"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-accent py-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
      >
        {status === "sending" ? "Sending link…" : "Send sign-in link"}
      </button>
      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </form>
  );
}
