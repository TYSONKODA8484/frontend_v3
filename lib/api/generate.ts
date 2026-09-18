import { authedFetch, authedJson, ApiError } from "@/lib/api/authed-fetch";
import type { BatchResponse, GenerateJob, GenerateResponse, ModelPreset, ToolSchema } from "@/lib/types/generate";

// Same schema for every user of a given feature_type — cache in memory per
// tab so switching between tools repeatedly doesn't re-fetch each time.
// authedFetch forces cache: "no-store" (correct for personalized data like
// billing/batches, but this isn't personalized), so this is a manual cache
// rather than relying on the fetch layer.
const schemaCache = new Map<string, ToolSchema>();

export async function getToolSchema(featureType: string): Promise<ToolSchema> {
  const cached = schemaCache.get(featureType);
  if (cached) return cached;
  const schema = await authedJson<ToolSchema>(`/tools/${featureType}/schema`);
  schemaCache.set(featureType, schema);
  return schema;
}

export async function generate(formData: FormData): Promise<GenerateResponse> {
  const res = await authedFetch("/generate", { method: "POST", body: formData });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || `Request failed with ${res.status}`);
  }
  return (await res.json()) as GenerateResponse;
}

export function getJob(jobId: string) {
  return authedJson<GenerateJob>(`/jobs/${jobId}`);
}

export function getBatch(batchId: string) {
  return authedJson<BatchResponse>(`/batches/${batchId}`);
}

export function getModelPresets() {
  return authedJson<{ presets: ModelPreset[] }>("/model-presets");
}
