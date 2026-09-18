import { API_URL } from "@/lib/api/base-url";
import type { MeResponse } from "@/lib/types/auth";

export async function sendAuthMail(email: string, continueUrl: string): Promise<{ sent: boolean }> {
  const res = await fetch(`${API_URL}/auth/authmail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, continue_url: continueUrl }),
  });
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("You've requested a link too recently — wait a moment and try again.");
    }
    throw new Error("Couldn't send the sign-in link. Please try again.");
  }
  return (await res.json()) as { sent: boolean };
}

export async function getMe(idToken: string): Promise<MeResponse> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error("Couldn't load your profile.");
  return (await res.json()) as MeResponse;
}
