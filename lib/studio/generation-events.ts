// Lists of past generations (Home's Recent Work, Library) fetch on mount and
// then go stale. Anything that finishes a generation announces it here so those
// lists can refresh themselves without a reload.
const EVENT = "shootpx:generations-changed";

export function notifyGenerationsChanged(): void {
  window.dispatchEvent(new Event(EVENT));
}

/** Subscribes to "a generation just finished"; returns the unsubscribe function. */
export function onGenerationsChanged(handler: () => void): () => void {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
