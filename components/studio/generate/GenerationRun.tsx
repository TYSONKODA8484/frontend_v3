"use client";

import { useEffect, useRef, useState } from "react";
import { getBatch } from "@/lib/api/generate";
import type { GenerateJob, JobStatus } from "@/lib/types/generate";
import { LottiePlayer } from "@/components/ui/LottiePlayer";
import generatingSpin from "@/lib/lottie/generating-spin.json";
import successCheck from "@/lib/lottie/success-check.json";

const STATUS_MESSAGES = [
  "Analyzing your image…",
  "Understanding the scene…",
  "Painting the details…",
  "Refining lighting and color…",
  "Almost there…",
];

const TERMINAL: JobStatus[] = ["completed", "failed"];

export function GenerationRun({
  batchId,
  initialJobs,
  grantedCount,
  requestedCount,
  partial,
  onReset,
}: {
  batchId: string;
  initialJobs: { jobId: string; status: JobStatus }[];
  grantedCount: number;
  requestedCount: number;
  partial: boolean;
  onReset: () => void;
}) {
  const [jobs, setJobs] = useState<GenerateJob[]>(initialJobs);
  const [polling, setPolling] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function poll() {
      getBatch(batchId)
        .then((res) => {
          setJobs(res.jobs);
          if (res.jobs.every((j) => TERMINAL.includes(j.status))) {
            setPolling(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        })
        .catch(() => {});
    }
    poll();
    intervalRef.current = setInterval(poll, 2500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
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
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="h-28 w-28">
          <LottiePlayer animationData={generatingSpin} />
        </div>
        <p className="text-[14px] text-muted">{STATUS_MESSAGES[messageIndex]}</p>
        <p className="text-xs text-dim">
          {doneCount}/{jobs.length || grantedCount} done
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {partial && (
        <p className="border border-accent p-3 text-[13px] text-accent">
          Generated {grantedCount} of {requestedCount} — not enough credits for the rest.
        </p>
      )}

      <div className="flex items-center gap-2">
        <div className="h-8 w-8 flex-none">
          <LottiePlayer animationData={successCheck} loop={false} />
        </div>
        <span className="text-[14px] font-semibold">
          {completed.length} image{completed.length === 1 ? "" : "s"} ready
          {failed.length ? `, ${failed.length} failed` : ""}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {jobs.map((j) => (
          <div key={j.jobId} className="relative aspect-square overflow-hidden border border-border bg-surface">
            {j.status === "completed" && j.outputUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote job output, dimensions unknown ahead of time
              <img src={j.outputUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center p-3 text-center text-xs text-dim">
                {j.status === "failed" ? j.errorMessage || "Generation failed" : "Pending"}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="rounded-full border border-border-strong py-3 text-sm font-medium hover:border-accent"
      >
        Generate again
      </button>
    </div>
  );
}
