"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getCachedToolSchema, getToolSchema, generate } from "@/lib/api/generate";
import { ApiError } from "@/lib/api/authed-fetch";
import { useTeam } from "@/lib/studio/TeamContext";
import { useTeamBilling } from "@/lib/studio/TeamBillingContext";
import { useToast } from "@/lib/studio/ToastContext";
import { ToolForm } from "@/components/studio/generate/ToolForm";
import { GenerationResults } from "@/components/studio/generate/results/GenerationResults";
import { ModelShootFlow } from "@/components/studio/generate/model-shoot/ModelShootFlow";
import { hasPendingInputs, takePendingInputs } from "@/lib/studio/send-to-store";
import { urlsToFiles } from "@/lib/tools/download";
import type { GenerateResponse, ToolSchema } from "@/lib/types/generate";

export function ToolGenerateClient({ featureType, isLive }: { featureType: string; isLive: boolean }) {
  const { activeTeamId } = useTeam();
  const { refetch: refetchBilling } = useTeamBilling();
  const { say } = useToast();

  // Paint from the last-seen schema immediately (it barely ever changes) and
  // revalidate quietly below, so coming back to a tool never shows a spinner.
  const [schema, setSchema] = useState<ToolSchema | null>(() => (isLive ? getCachedToolSchema(featureType) : null));
  // Not live in the catalog — known synchronously from the prop, so there's
  // nothing to load and no schema fetch ever fires (this is the actual
  // access gate; the catalog page just hides the link).
  const [schemaLoading, setSchemaLoading] = useState(() => isLive && !getCachedToolSchema(featureType));
  const [schemaError, setSchemaError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [run, setRun] = useState<GenerateResponse | null>(null);
  // The backend allows one generation per user at a time.
  const [running, setRunning] = useState(false);
  // Boxes to show from the instant Generate is hit, before the server replies.
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  // Images sent here from another tool's results ("Send to…"). They're
  // downloaded back into Files before the form mounts, so it can start with
  // them already added.
  const [awaitingInputs, setAwaitingInputs] = useState(() => hasPendingInputs(featureType));
  const [incoming, setIncoming] = useState<File[]>([]);

  useEffect(() => {
    const urls = takePendingInputs(featureType);
    if (!urls) return;
    urlsToFiles(urls)
      .then((files) => {
        setIncoming(files);
        if (files.length < urls.length) say("Some images couldn't be loaded from the other tool.");
      })
      .finally(() => setAwaitingInputs(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per mount
  }, []);

  useEffect(() => {
    if (!isLive) return;
    // The initial state already covers the cached (no spinner) and uncached
    // (spinner) cases, so this only revalidates against the network.
    getToolSchema(featureType)
      .then(setSchema)
      .catch((err) => {
        if (getCachedToolSchema(featureType)) return; // keep showing what we have
        setSchemaError(
          err instanceof ApiError && err.status === 404
            ? "This tool isn't available yet."
            : "Couldn't load this tool right now.",
        );
      })
      .finally(() => setSchemaLoading(false));
  }, [featureType, isLive]);

  async function handleSubmit(formData: FormData, expectedCount: number) {
    if (running) return; // one generation at a time — Generate is disabled until it settles
    if (!activeTeamId) {
      say("No active team found");
      return;
    }
    formData.append("team_id", activeTeamId);
    setSubmitting(true);
    setPendingCount(expectedCount);
    try {
      const res = await generate(formData);
      setRun(res);
      // Same tick as the run itself, so Generate never flashes enabled between
      // the server answering and the results panel taking over.
      setRunning(true);
      // Credits are held/granted at submission — reflect that immediately
      // rather than waiting for the next background billing poll.
      refetchBilling();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && /already in progress/i.test(err.message)) {
          say("A generation is already running — wait for it to finish first.");
        } else if (err.status === 403) {
          say("You need to be a member of this team to generate.");
        } else if (err.status === 503) {
          say("The generation service is busy — please try again in a moment.");
        } else if (err.status === 400) {
          say("Couldn't start generation — check your inputs.");
        } else {
          say("Couldn't start generation. Please try again.");
        }
      } else {
        say("Couldn't start generation. Please try again.");
      }
    } finally {
      setPendingCount(null);
      setSubmitting(false);
    }
  }

  if (!isLive) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-11 text-center text-dim">
        <span className="text-3xl opacity-50">▢</span>
        <span className="text-[15px] font-semibold text-muted">This tool isn&apos;t available yet.</span>
      </div>
    );
  }

  if (schemaLoading || awaitingInputs) {
    return (
      <div className="flex h-full items-center justify-center text-dim">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (schemaError || !schema) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-11 text-center text-dim">
        <span className="text-3xl opacity-50">▢</span>
        <span className="text-[15px] font-semibold text-muted">
          {schemaError || "This tool isn't available yet."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {schema.featureType === "model_shoot" ? (
        <ModelShootFlow
          schema={schema}
          running={running}
          initialGarments={incoming}
          onSubmitting={setPendingCount}
          onStarted={(res) => {
            setRun(res);
            setRunning(true);
            // Credits are held at submission — reflect that right away.
            refetchBilling();
          }}
        />
      ) : (
        <ToolForm
          schema={schema}
          onSubmit={handleSubmit}
          submitting={submitting}
          running={running}
          initialImages={incoming}
        />
      )}
      <div className="flex-1 overflow-auto">
        <GenerationResults featureType={schema.featureType} run={run} pendingCount={pendingCount} onRunningChange={setRunning} />
      </div>
    </div>
  );
}
