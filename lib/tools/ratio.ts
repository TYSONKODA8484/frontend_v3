/** Parses "3:4", "Portrait 9:16" etc. Falls back to square for "Square"/"Original"/unknown. */
export function parseRatio(text: string): number {
  const m = /(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/.exec(text);
  if (m) {
    const w = Number(m[1]);
    const h = Number(m[2]);
    if (w > 0 && h > 0) return w / h;
  }
  return 1;
}

/** Pixel size of a `box`×`box` preview tile drawn at the given width/height ratio — 1:1 is a true square. */
export function ratioShape(ratio: number, box: number): { width: number; height: number } {
  return ratio >= 1
    ? { width: box, height: Math.round(box / ratio) }
    : { width: Math.round(box * ratio), height: box };
}
