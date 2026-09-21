const PREFIX = "shootpx:cache:";

/**
 * Last-known-good data for team-scoped fetches (teams, billing, usage,
 * recent work), so a reload shows the previous result instantly instead of
 * a loading state, while the real fetch silently revalidates it in the
 * background. sessionStorage rather than localStorage — it's cleared when
 * the tab closes, so credits/usage numbers can never go stale across days,
 * only across a single reload within one session.
 */
export function readCache<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  try {
    window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // sessionStorage unavailable (private browsing, quota) — skip caching
  }
}
