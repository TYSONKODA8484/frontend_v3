import { ApiError } from "@/lib/api/authed-fetch";

export const MAX_TOTAL_IMAGES = 10;
export const MAX_EXTRA_SLOTS = 3;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

// total credits = resolution_credit × output_count (no quality multiplier).
const RESOLUTION_CREDITS: Record<string, number> = { "1k": 4, "2k": 6, "4k": 8 };

export function modelShootCost(resolution: string, outputCount: number): number | null {
  const per = RESOLUTION_CREDITS[resolution];
  return per ? per * outputCount : null;
}

export type ModelChoice =
  | { kind: "preset"; id: string; name: string; thumbnailUrl: string }
  | { kind: "upload"; file: File }
  | { kind: "job"; jobId: string; url: string };

export type ExtraSlot = { id: string; label: string };

/** Returns the files that pass type/size checks, plus the first problem found. */
export function filterUploads(incoming: File[]): { accepted: File[]; error: string } {
  const accepted: File[] = [];
  let error = "";
  for (const f of incoming) {
    if (!ACCEPTED_TYPES.includes(f.type)) error = `${f.name} isn't a PNG, JPEG or WebP.`;
    else if (f.size > MAX_FILE_BYTES) error = `${f.name} is over the 10 MB limit.`;
    else accepted.push(f);
  }
  return { accepted, error };
}

export type ShootError = { message: string; kind: "credits" | "other" };

// Backend errors arrive as the raw body — usually {"detail": "..."} — and the
// messages are written for users, so surface them as-is where they matter.
function detailOf(err: ApiError): string {
  try {
    const parsed = JSON.parse(err.message) as { detail?: unknown };
    if (typeof parsed.detail === "string") return parsed.detail;
  } catch {
    // not JSON — fall through
  }
  return err.message;
}

export function describeShootError(err: unknown): ShootError {
  if (!(err instanceof ApiError)) return { message: "Couldn't start the shoot. Please try again.", kind: "other" };
  const detail = detailOf(err);
  if (err.status === 400) {
    if (/insufficient credits/i.test(detail)) return { message: detail, kind: "credits" };
    if (/already in progress/i.test(detail)) {
      return { message: "A generation is already running — wait for it to finish first.", kind: "other" };
    }
    if (/cannot be generated/i.test(detail)) {
      return { message: "This combination of model and garment cannot be generated.", kind: "other" };
    }
    if (/not available/i.test(detail)) {
      return { message: "One or more selected images are no longer available.", kind: "other" };
    }
    return { message: detail || "Check your inputs and try again.", kind: "other" };
  }
  if (err.status === 404) return { message: "That model is no longer available — pick another.", kind: "other" };
  if (err.status === 403) return { message: "You need to be a member of this team to generate.", kind: "other" };
  if (err.status === 429) return { message: "Too many requests — wait a moment and try again.", kind: "other" };
  if (err.status === 503) return { message: "Failed to plan the shoot. Please try again.", kind: "other" };
  return { message: "Couldn't start the shoot. Please try again.", kind: "other" };
}
