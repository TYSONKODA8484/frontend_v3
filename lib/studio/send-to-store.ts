// "Send to…" hands generated images from one tool page to another. Files can't
// survive a route change, so the source's image URLs wait here (in memory)
// until the target tool page picks them up and downloads them as inputs.
let pending: { target: string; urls: string[] } | null = null;

export function setPendingInputs(target: string, urls: string[]): void {
  pending = { target, urls };
}

export function hasPendingInputs(target: string): boolean {
  return pending?.target === target;
}

/** Returns the waiting URLs for this tool (once), or null. */
export function takePendingInputs(target: string): string[] | null {
  if (pending?.target !== target) return null;
  const urls = pending.urls;
  pending = null;
  return urls;
}
