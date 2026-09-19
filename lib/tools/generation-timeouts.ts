// How long the UI waits on a batch before it stops spinning and offers a way
// out. Roughly the backend's own hard timeout for that tool plus a buffer, so a
// job that's merely slow still finishes normally. NOT confirmed per tool with
// backend yet — model_shoot (300s) and model_shoot_generate_model (~75s typical)
// are from the backend handoff; the rest use the default. Update once backend
// confirms each tool's generation_timeout_seconds.
const BUFFER_MS = 60_000;

const BACKEND_TIMEOUT_S: Record<string, number> = {
  model_shoot: 300,
  model_shoot_generate_model: 120,
};
const DEFAULT_BACKEND_TIMEOUT_S = 300;

export function generationCeilingMs(featureType: string): number {
  return (BACKEND_TIMEOUT_S[featureType] ?? DEFAULT_BACKEND_TIMEOUT_S) * 1000 + BUFFER_MS;
}
