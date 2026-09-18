"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getToolSchema, generate } from "@/lib/api/generate";
import { ApiError } from "@/lib/api/authed-fetch";
import { useTeam } from "@/lib/studio/TeamContext";
import { useToast } from "@/lib/studio/ToastContext";
import { ToolForm } from "@/components/studio/generate/ToolForm";
import { GenerationRun } from "@/components/studio/generate/GenerationRun";
import { EmptyResults } from "@/components/studio/generate/EmptyResults";
import type { GenerateResponse, ToolSchema } from "@/lib/types/generate";

// model_shoot uses grouped image fields (model_image/top_images/etc), not the
// generic images[] every other tool uses — its dedicated flow isn't built yet.
const UNSUPPORTED_FEATURE_TYPES = new Set(["model_shoot"]);

export default function ToolGeneratePage() {
  const { slug } = useParams<{ slug: string }>();
  const { activeTeamId } = useTeam();
  const { say } = useToast();

  const [schema, setSchema] = useState<ToolSchema | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(true);
  const [schemaError, setSchemaError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [run, setRun] = useState<GenerateResponse | null>(null);

  useEffect(() => {
    // Fetching the schema when the tool slug changes is exactly what this
    // effect is for; the lint rule flags the loading-flag set that precedes it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSchemaLoading(true);
    getToolSchema(slug)
      .then(setSchema)
      .catch((err) => {
        setSchemaError(
          err instanceof ApiError && err.status === 404
            ? "This tool isn't available yet."
            : "Couldn't load this tool right now.",
        );
      })
      .finally(() => setSchemaLoading(false));
  }, [slug]);

  async function handleSubmit(formData: FormData) {
    if (!activeTeamId) {
      say("No active team found");
      return;
    }
    formData.append("team_id", activeTeamId);
    setSubmitting(true);
    try {
      const res = await generate(formData);
      setRun(res);
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
      setSubmitting(false);
    }
  }

  if (schemaLoading) {
    return (
      <div className="flex h-full items-center justify-center text-dim">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (schemaError || !schema || UNSUPPORTED_FEATURE_TYPES.has(schema.featureType)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-11 text-center text-dim">
        <span className="text-3xl opacity-50">▢</span>
        <span className="text-[15px] font-semibold text-muted">
          {schemaError || "This tool's flow isn't built yet."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <ToolForm schema={schema} onSubmit={handleSubmit} submitting={submitting} />
      <div className="flex-1 overflow-auto">
        {run ? (
          <GenerationRun
            key={run.batchId}
            batchId={run.batchId}
            initialJobs={run.jobs}
            grantedCount={run.grantedCount}
            requestedCount={run.requestedCount}
            partial={run.partial}
          />
        ) : (
          <EmptyResults />
        )}
      </div>
    </div>
  );
}
