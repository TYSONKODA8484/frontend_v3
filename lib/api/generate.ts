import { authedFetch, authedJson, ApiError } from "@/lib/api/authed-fetch";
import { readCache, writeCache } from "@/lib/studio/session-cache";
import type { BatchResponse, GenerateJob, GenerateResponse, ModelPreset, ToolSchema } from "@/lib/types/generate";

// Same schema for every user of a given feature_type — cache in memory per
// tab so switching between tools repeatedly doesn't re-fetch each time.
// authedFetch forces cache: "no-store" (correct for personalized data like
// billing/batches, but this isn't personalized), so this is a manual cache
// rather than relying on the fetch layer.
const schemaCache = new Map<string, ToolSchema>();

const schemaStorageKey = (featureType: string) => `schema:${featureType}`;

/** Synchronous read of a schema seen earlier (this tab, or earlier in the
 * session), so a tool page can render its form on the very first paint. */
export function getCachedToolSchema(featureType: string): ToolSchema | null {
  return schemaCache.get(featureType) ?? readCache<ToolSchema>(schemaStorageKey(featureType));
}

// Always resolves from the network (so callers can silently revalidate what
// they painted from cache) and refreshes both caches.
export async function getToolSchema(featureType: string): Promise<ToolSchema> {
  const schema = await authedJson<ToolSchema>(`/tools/${featureType}/schema`);
  schemaCache.set(featureType, schema);
  writeCache(schemaStorageKey(featureType), schema);
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

const PRESETS_KEY = "model-presets";

export function getCachedModelPresets(): ModelPreset[] | null {
  return readCache<ModelPreset[]>(PRESETS_KEY);
}

export async function getModelPresets() {
  const res = await authedJson<{ presets: ModelPreset[] }>("/model-presets");
  writeCache(PRESETS_KEY, res.presets);
  return res;
}
