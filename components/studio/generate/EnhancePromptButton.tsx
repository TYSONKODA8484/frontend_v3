"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { ApiError } from "@/lib/api/authed-fetch";
import { EnhanceJobError, enhancePrompt } from "@/lib/api/enhance-prompt";
import { useTeam } from "@/lib/studio/TeamContext";

/** Long enough for a few sentences; the backend sets no limit of its own. */
export const PROMPT_MAX_LENGTH = 500;

function describe(err: unknown): string {
  // A failed job carries the backend's own user-facing text — show it as-is.
  if (err instanceof EnhanceJobError) return err.message;
  if (err instanceof ApiError) {
    if (err.status === 400 && /in progress/i.test(err.message)) {
      return "Wait for the current generation to finish, then try again.";
    }
    if (err.status === 429) return "Too many requests — wait a moment and try again.";
    if (err.status === 403) return "You need to be a member of this team.";
  }
  return "Couldn't enhance the prompt — try again.";
}

/**
 * "✨ Enhance prompt · Free" under a prompt box. The rewrite comes back as a
 * suggestion to Accept or Dismiss — it never silently replaces the user's
 * text, since the rewrite can differ noticeably from what they typed.
 * `onBusyChange` lets the form block Generate while the enhance job runs
 * (the backend allows one active job per user).
 */
export function EnhancePromptButton({
  value,
  featureType,
  onApply,
  onBusyChange,
}: {
  value: string;
  /** The tool whose prompt box this is — sent as source_feature_type. */
  featureType: string;
  onApply: (prompt: string) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { activeTeamId } = useTeam();
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const empty = !value.trim();

  async function run() {
    if (busy || empty || !activeTeamId) return;
    setBusy(true);
    setError("");
    setSuggestion(null);
    onBusyChange?.(true);
    try {
      const text = await enhancePrompt(activeTeamId, value.trim(), featureType);
      if (mounted.current) setSuggestion(text);
    } catch (err) {
      if (mounted.current) setError(describe(err));
    } finally {
      if (mounted.current) setBusy(false);
      onBusyChange?.(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={run}
        disabled={busy || empty}
        title={empty ? "Type a prompt first" : undefined}
        className="flex items-center gap-1.5 self-start text-xs text-accent hover:text-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkles size={13} className={busy ? "animate-pulse" : ""} />
        {busy ? "Enhancing… (about 20s)" : "Enhance prompt"}
        {/* <span className="text-dim">· Free</span> */}
      </button>

      {error && <p className="text-[12px] text-[#ff8a6b]">{error}</p>}

      {suggestion && (
        <div className="flex flex-col gap-2 border border-accent/60 bg-surface p-3">
          <span className="font-mono text-[10.5px] tracking-wide text-dim">SUGGESTED PROMPT</span>
          <p className="max-h-40 overflow-auto text-[12.5px] leading-relaxed text-text">{suggestion}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onApply(suggestion.slice(0, PROMPT_MAX_LENGTH));
                setSuggestion(null);
              }}
              className="rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-semibold text-accent-ink hover:bg-accent-hover"
            >
              Use this
            </button>
            <button
              onClick={() => setSuggestion(null)}
              className="rounded-full border border-border-strong px-3.5 py-1.5 text-[12px] text-muted hover:text-text"
            >
              Keep mine
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
