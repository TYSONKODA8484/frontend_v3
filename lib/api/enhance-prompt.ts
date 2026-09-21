import { generate, getJob } from "@/lib/api/generate";

const POLL_MS = 1800;
const TIMEOUT_MS = 60_000;

export class EnhanceTimeoutError extends Error {}

/** The job failed; `message` is the API's errorMessage, already user-facing. */
export class EnhanceJobError extends Error {}

/**
 * Free "improve my prompt" action. Same submit-then-poll flow as an image
 * generation (feature_type=enhance_prompt), but the result is text, in the
 * job's outputText. `sourceFeatureType` must be the real tool the prompt box
 * belongs to — it tunes the rewrite, and a bad value fails the job.
 */
export async function enhancePrompt(
  teamId: string,
  prompt: string,
  sourceFeatureType: string,
): Promise<string> {
  const fd = new FormData();
  fd.append("team_id", teamId);
  fd.append("feature_type", "enhance_prompt");
  fd.append("prompt", prompt);
  fd.append("source_feature_type", sourceFeatureType);

  const { jobs } = await generate(fd);
  const jobId = jobs[0]?.jobId;
  if (!jobId) throw new Error("No job returned");

  const started = Date.now();
  while (Date.now() - started < TIMEOUT_MS) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    const job = await getJob(jobId);
    if (job.status === "completed") {
      if (job.outputText?.trim()) return job.outputText.trim();
      throw new Error("Empty result");
    }
    if (job.status === "failed") throw new EnhanceJobError(job.errorMessage || "Couldn't enhance the prompt — try again.");
  }
  throw new EnhanceTimeoutError();
}
