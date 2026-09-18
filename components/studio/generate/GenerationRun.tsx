"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getBatch } from "@/lib/api/generate";
import type { GenerateJob, JobStatus } from "@/lib/types/generate";
import { LottieIcon } from "@/components/ui/LottieIcon";
import loading from "react-useanimations/lib/loading";
import checkmark from "react-useanimations/lib/checkmark";

const STATUS_MESSAGES = [
  "Analyzing your image…",
  "Understanding the scene…",
  "Painting the details…",
  "Refining lighting and color…",
  "Almost there…",
];

const TERMINAL: JobStatus[] = ["completed", "failed"];

// Jobs often finish within a few seconds, so poll tightly at first — then
// back off, since a generation that's still running after a minute doesn't
// need sub-2s freshness, and every poll is a request the backend has to
// serve. Cuts total request volume roughly in half for longer jobs.
function pollDelay(elapsedMs: number): number {
  if (elapsedMs < 15_000) return 2000;
  if (elapsedMs < 60_000) return 4000;
  return 8000;
}

export function GenerationRun({
  batchId,
  initialJobs,
  grantedCount,
  requestedCount,
  partial,
  featureType,
}: {
  batchId: string;
  initialJobs: { jobId: string; status: JobStatus }[];
  grantedCount: number;
  requestedCount: number;
  partial: boolean;
  featureType?: string;
}) {
  const [jobs, setJobs] = useState<GenerateJob[]>(initialJobs);
  const [polling, setPolling] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();

    function poll() {
      getBatch(batchId)
        .then((res) => {
          if (cancelled) return;
          setJobs(res.jobs);
          if (res.jobs.every((j) => TERMINAL.includes(j.status))) {
            setPolling(false);
            return;
          }
          timeoutId = setTimeout(poll, pollDelay(Date.now() - startedAt));
        })
        .catch(() => {
          if (!cancelled) timeoutId = setTimeout(poll, pollDelay(Date.now() - startedAt));
        });
    }
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [batchId]);

  useEffect(() => {
    if (!polling) return;
    const t = setInterval(() => setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length), 3000);
    return () => clearInterval(t);
  }, [polling]);

  const completed = jobs.filter((j) => j.status === "completed");
  const failed = jobs.filter((j) => j.status === "failed");
  const doneCount = jobs.filter((j) => TERMINAL.includes(j.status)).length;

  if (polling) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <LottieIcon animation={loading} size={72} />
        <p className="text-[14px] text-muted">{STATUS_MESSAGES[messageIndex]}</p>
        <p className="text-xs text-dim">
          {doneCount}/{jobs.length || grantedCount} done
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {partial && (
        <p className="border border-accent p-3 text-[13px] text-accent">
          Generated {grantedCount} of {requestedCount} — not enough credits for the rest.
        </p>
      )}

      <div className="flex items-center gap-2">
        <LottieIcon animation={checkmark} size={28} loop={false} />
        <span className="text-[14px] font-semibold">
          {completed.length} image{completed.length === 1 ? "" : "s"} ready
          {failed.length ? `, ${failed.length} failed` : ""}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {jobs.map((j, i) => (
          <div key={j.jobId} className="relative aspect-square overflow-hidden border border-border bg-surface">
            {j.status === "completed" && j.outputUrl ? (
              <Image
                src={j.outputUrl}
                alt=""
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-3 text-center text-xs text-dim">
                {j.status === "failed" ? j.errorMessage || "Generation failed" : "Pending"}
              </div>
            )}
            {/* Batch order matches shot order, but the planner's internal
                front/side/detail labels aren't exposed by /batches — number
                only, rather than fabricating a shot type. */}
            {featureType === "listing_photoshoot" && (
              <span className="absolute left-1.5 top-1.5 bg-bg/80 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                Shot {i + 1}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
