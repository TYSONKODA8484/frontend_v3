import { getFirebaseAuth } from "@/lib/firebase/client";

export async function getIdToken(): Promise<string | null> {
  const authPromise = getFirebaseAuth();
  if (!authPromise) return null;
  const auth = await authPromise;
  return auth.currentUser?.getIdToken() ?? null;
}
