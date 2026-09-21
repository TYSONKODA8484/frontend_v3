import { NextResponse } from "next/server";

// Sends signups to the Google Apps Script web app (JSON in, { ok, error } out)
// that appends them to the sheet. Done server-side so the script URL stays out of the browser and there
// is no CORS problem with Google's redirecting endpoint.
const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Light per-IP throttle (resets on redeploy/cold start) so the form can't be
// used to flood the sheet.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  if (!SCRIPT_URL) {
    return NextResponse.json({ error: "Signups aren't set up yet." }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (tooMany(ip)) {
    return NextResponse.json({ error: "Too many attempts — try again in a minute." }, { status: 429 });
  }

  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim() : "";
  } catch {
    // fall through to validation
  }
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    // The script does JSON.parse(e.postData.contents), so send a JSON body.
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      redirect: "follow",
      cache: "no-store",
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    // The script answers HTTP 200 even on failure, with { ok: false, error }.
    if (!res.ok || data.ok === false) {
      console.error("[waitlist] script rejected the signup:", data.error ?? res.status);
      return NextResponse.json({ error: "Couldn't save your email. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] request to the script failed:", err);
    return NextResponse.json({ error: "Couldn't save your email. Please try again." }, { status: 502 });
  }
}
