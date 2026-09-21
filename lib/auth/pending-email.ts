const STORAGE_KEY = "shootpx:pending-auth-email";

export function savePendingEmail(email: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, email);
  } catch {
    // localStorage unavailable (private mode, blocked storage) — the callback
    // page falls back to asking the user to re-enter their email.
  }
}

export function readPendingEmail(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearPendingEmail() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clear if storage was never writable
  }
}
