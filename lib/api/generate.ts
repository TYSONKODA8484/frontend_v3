import { authedFetch, authedJson, ApiError } from "@/lib/api/authed-fetch";
import type { BatchResponse, GenerateJob, GenerateResponse, ModelPreset, ToolSchema } from "@/lib/types/generate";

export function getToolSchema(featureType: string) {
  return authedJson<ToolSchema>(`/tools/${featureType}/schema`);
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
