"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getBatch } from "@/lib/api/generate";
import { useTeamBilling } from "@/lib/studio/TeamBillingContext";
import { useToast } from "@/lib/studio/ToastContext";
import { notifyGenerationsChanged } from "@/lib/studio/generation-events";
import { generationCeilingMs } from "@/lib/tools/generation-timeouts";
import { downloadUrl } from "@/lib/tools/download";
import type { GenerateJob, GenerateResponse, JobStatus } from "@/lib/types/generate";
import { LottieIcon } from "@/components/ui/LottieIcon";
import loading from "react-useanimations/lib/loading";
import { EmptyResults } from "../EmptyResults";
import { ImageViewer } from "./ImageViewer";
import { SendToMenu } from "./SendToMenu";

const TERMINAL: JobStatus[] = ["completed", "failed"];
const STATUS_MESSAGES = [
  "Analyzing your image…",
  "Understanding the scene…",
  "Painting the details…",
  "Refining lighting and color…",
  "Almost there…",
];

// Poll tightly at first, then back off — a long job doesn't need sub-2s freshness.
const pollDelay = (elapsedMs: number) => (elapsedMs < 15_000 ? 2000 : elapsedMs < 60_000 ? 4000 : 8000);

type Finished = {
  batchId: string;
  images: string[];
  failed: number;
  /** Jobs that never reached a final status before the user stopped waiting. */
  unfinished: number;
  /** Each distinct job errorMessage, exactly as the API returned it. */
  failMessages: string[];
  partial: boolean;
  granted: number;
  requested: number;
};

/**
 * The results side of a tool page, for the whole session on that page:
 * the newest generation on top (with a loader in its place while it runs),
 * older generations stacked as "Generation N" folders you can open.
 */
export function GenerationResults({
  featureType,
  run,
  pendingCount,
  onRunningChange,
}: {
  featureType: string;
  /** A fresh object per submit; a new batchId starts a new tracked generation. */
  run: GenerateResponse | null;
  /** Set the moment Generate is hit (before the server answers): how many boxes to show. */
  pendingCount: number | null;
  onRunningChange: (running: boolean) => void;
}) {
  const { refetch: refetchBilling } = useTeamBilling();
  const { say } = useToast();

  const [finished, setFinished] = useState<Finished[]>([]); // newest first
  const [jobs, setJobs] = useState<GenerateJob[]>([]);
  // Past the ceiling with jobs still queued/processing: stop polling, say so, offer a way out.
  const [stalled, setStalled] = useState(false);
  const stallActions = useRef<{ check: () => void; giveUp: () => void } | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [openBatchId, setOpenBatchId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);

  const batchId = run?.batchId;
  useEffect(() => {
    if (!run) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();
    // Starting a run resets the view — this effect is the sync point with
    // the backend job, which is what the lint rule is warning about.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJobs([]);
    setStalled(false);
    setOpenBatchId(null);
    const ceiling = generationCeilingMs(featureType);
    let latestJobs: GenerateJob[] = [];
    onRunningChange(true);

    function settle(jobs: GenerateJob[], unfinished = 0) {
      const done = jobs.filter((j) => j.status === "completed" && j.outputUrl);
      const failedJobs = jobs.filter((j) => j.status === "failed");
      setFinished((prev) => [
        {
          batchId: run!.batchId,
          images: done.map((j) => j.outputUrl as string),
          failed: failedJobs.length,
          unfinished,
          failMessages: [...new Set(failedJobs.map((j) => j.errorMessage).filter((m): m is string => !!m))],
          partial: run!.partial,
          granted: run!.grantedCount,
          requested: run!.requestedCount,
        },
        ...prev,
      ]);
      // Failed jobs are refunded — settled charges land once the batch is done.
      refetchBilling();
      notifyGenerationsChanged();
      onRunningChange(false);
    }

    function poll() {
      // The escape hatch: never poll forever, whatever the backend is doing
      // (including when the polls themselves keep failing).
      if (Date.now() - startedAt > ceiling) {
        setStalled(true);
        return;
      }
      getBatch(run!.batchId)
        .then((res) => {
          if (cancelled) return;
          latestJobs = res.jobs;
          setJobs(res.jobs);
          const n = res.jobs.filter((j) => TERMINAL.includes(j.status)).length;
          if (res.jobs.length > 0 && n === res.jobs.length) return settle(res.jobs);
          timeoutId = setTimeout(poll, pollDelay(Date.now() - startedAt));
        })
        .catch(() => {
          if (!cancelled) timeoutId = setTimeout(poll, pollDelay(Date.now() - startedAt));
        });
    }
    poll();

    stallActions.current = {
      // Manual "Check again": one look at the batch; it settles if it is done.
      check: () => {
        getBatch(run!.batchId)
          .then((res) => {
            if (cancelled) return;
            latestJobs = res.jobs;
            setJobs(res.jobs);
            if (res.jobs.length > 0 && res.jobs.every((j) => TERMINAL.includes(j.status))) {
              setStalled(false);
              settle(res.jobs);
            } else say("Still processing — it is taking longer than expected.");
          })
          .catch(() => say("Could not check the status right now — try again."));
      },
      // "Stop waiting": keep whatever finished and release the page.
      giveUp: () => {
        cancelled = true;
        clearTimeout(timeoutId);
        const open = latestJobs.filter((j) => !TERMINAL.includes(j.status)).length;
        setStalled(false);
        settle(latestJobs, latestJobs.length === 0 ? run!.grantedCount : open);
      },
    };
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      stallActions.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the batch; callbacks are stable enough
  }, [batchId]);

  // Loading from the instant Generate is hit (pendingCount) until the batch
  // settles. Derived, not stored, so there is no flash between submit and
  // the first poll.
  const runPending = !!run && !finished.some((b) => b.batchId === run.batchId);
  const active = runPending || pendingCount != null;

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setMessageIndex((i) => (i + 1) % STATUS_MESSAGES.length), 3000);
    return () => clearInterval(t);
  }, [active]);

  const number = (b: Finished) => finished.length - finished.indexOf(b);
  const filename = (b: Finished, i: number) => `shootpx-${featureType}-${number(b)}-${i + 1}.png`;

  async function saveOne(url: string, name: string) {
    if (!(await downloadUrl(url, name))) say("Couldn't download the image — please try again");
  }

  function downloadAll(b: Finished) {
    say(`Downloading ${b.images.length} image${b.images.length === 1 ? "" : "s"}…`);
    b.images.forEach((url, i) => setTimeout(() => saveOne(url, filename(b, i)), i * 250));
  }

  if (!active && finished.length === 0) return <EmptyResults />;

  const opened = finished.find((b) => b.batchId === openBatchId) ?? null;
  const imageGrid = (b: Finished) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {b.images.map((url, i) => (
        <button
          key={url + i}
          onClick={() => setViewing(url)}
          className="relative aspect-square cursor-pointer overflow-hidden border border-border bg-surface"
        >
          <Image src={url} alt="" fill sizes="(min-width: 640px) 20vw, 45vw" className="object-cover" />
        </button>
      ))}
    </div>
  );

  const notes = (b: Finished) => (
    <>
      {b.partial && (
        <p className="border border-accent p-3 text-[13px] text-accent">
          Generated {b.granted} of {b.requested} — not enough credits for the rest.
        </p>
      )}
      {b.unfinished > 0 && (
        <p className="text-[12.5px] text-[#ff8a6b]">
          {b.unfinished} {b.unfinished === 1 ? "image" : "images"} did not finish. If they complete later they will
          appear in your Library.
        </p>
      )}
      {b.failed > 0 && (
        <div className="flex flex-col gap-1 text-[12.5px] text-[#ff8a6b]">
          {/* The API's errorMessage is already user-facing — shown verbatim, unprefixed. */}
          {(b.failMessages ?? []).map((m) => (
            <p key={m}>{m}</p>
          ))}
          <p className="text-dim">
            {b.failed} {b.failed === 1 ? "image" : "images"} failed. Failed images are refunded.
          </p>
        </div>
      )}
    </>
  );

  // ---- A generation opened from a folder card ------------------------------
  if (opened) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3.5">
          <button onClick={() => setOpenBatchId(null)} className="text-[13px] text-dim hover:text-text">
            ← Back
          </button>
          <span className="text-sm font-semibold">
            Generation {number(opened)} · {opened.images.length} images
          </span>
          <div className="ml-auto flex items-center gap-2">
            <SendToMenu currentFeatureType={featureType} urls={opened.images} />
            <button
              onClick={() => downloadAll(opened)}
              className="rounded-full bg-accent px-[18px] py-[9px] text-[13px] font-semibold text-accent-ink hover:bg-accent-hover"
            >
              Download all
            </button>
          </div>
        </div>
        {notes(opened)}
        {imageGrid(opened)}
        {viewing && (
          <ImageViewer
            url={viewing}
            onClose={() => setViewing(null)}
            onDownload={() => saveOne(viewing, filename(opened, Math.max(0, opened.images.indexOf(viewing))))}
          />
        )}
      </div>
    );
  }

  // ---- Latest generation (or its loader) + earlier generations as folders --
  const latest = active ? null : finished[0];
  const older = active ? finished : finished.slice(1);
  const slots = runPending ? Math.max(run!.grantedCount, 1) : Math.max(pendingCount ?? 0, 1);

  return (
    <div className="flex flex-col gap-6 p-6">
      {active && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: slots }, (_, i) => {
            const job = runPending ? jobs[i] : undefined;
            if (job?.status === "completed" && job.outputUrl) {
              return (
                <button
                  key={i}
                  onClick={() => setViewing(job.outputUrl as string)}
                  className="relative aspect-square cursor-pointer overflow-hidden border border-border bg-surface"
                >
                  <Image src={job.outputUrl} alt="" fill sizes="20vw" className="object-cover" />
                </button>
              );
            }
            if (job?.status === "failed") {
              return (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center border border-border bg-surface p-3 text-center text-xs text-dim"
                >
                  {job.errorMessage || "Generation failed"}
                </div>
              );
            }
            if (stalled) {
              return (
                <div
                  key={i}
                  className="flex aspect-square flex-col items-center justify-center gap-2 border border-border bg-surface p-3 text-center"
                >
                  <span className="text-[12px] font-medium text-text">Taking longer than expected</span>
                  <span className="text-[11px] text-dim">This one has not finished yet.</span>
                </div>
              );
            }
            return (
              <div
                key={i}
                className="flex aspect-square flex-col items-center justify-center gap-2 border border-border bg-surface p-3 text-center"
              >
                <LottieIcon animation={loading} size={48} />
                <span className="text-[12px] text-muted">{STATUS_MESSAGES[messageIndex]}</span>
              </div>
            );
          })}
        </div>
      )}

      {active && stalled && (
        <div className="flex flex-wrap items-center gap-3 border border-[#ff8a6b]/50 bg-surface p-3.5">
          <p className="min-w-[200px] flex-1 text-[13px] text-muted">
            This is taking longer than expected. Your credits are safe — failed jobs are refunded. You can check
            again, or stop waiting and keep whatever has finished.
          </p>
          <button
            onClick={() => stallActions.current?.check()}
            className="rounded-full bg-accent px-4 py-2 text-[12.5px] font-semibold text-accent-ink hover:bg-accent-hover"
          >
            Check again
          </button>
          <button
            onClick={() => stallActions.current?.giveUp()}
            className="rounded-full border border-border-strong px-4 py-2 text-[12.5px] text-muted hover:text-text"
          >
            Stop waiting
          </button>
        </div>
      )}

      {latest && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-end">
            <SendToMenu currentFeatureType={featureType} urls={latest.images} small />
          </div>
          {notes(latest)}
          {latest.images.length > 0 && imageGrid(latest)}
        </div>
      )}

      {older.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {older.map((b) => (
            <button
              key={b.batchId}
              onClick={() => setOpenBatchId(b.batchId)}
              disabled={b.images.length === 0}
              className="relative aspect-square text-left disabled:opacity-50"
            >
              <div className="absolute inset-[8px_0_0_8px] border border-border bg-surface-2" />
              <div className="absolute inset-1 border border-border bg-surface-2" />
              <div className="absolute inset-0 overflow-hidden border border-border-strong bg-surface">
                {b.images[0] && <Image src={b.images[0]} alt="" fill sizes="20vw" className="object-cover" />}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent [background-size:100%_55%] bg-bottom bg-no-repeat" />
              <div className="absolute bottom-2 left-2.5 text-white">
                <div className="text-[12.5px] font-semibold">Generation {number(b)}</div>
                <div className="text-[10.5px] text-white/75">{b.images.length} images</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {viewing && (
        <ImageViewer
          url={viewing}
          onClose={() => setViewing(null)}
          onDownload={() => saveOne(viewing, `shootpx-${featureType}.png`)}
        />
      )}
    </div>
  );
}
