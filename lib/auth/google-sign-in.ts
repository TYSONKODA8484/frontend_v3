import { getFirebaseAuth } from "@/lib/firebase/client";

export async function signInWithGoogle(): Promise<void> {
  const authPromise = getFirebaseAuth();
  if (!authPromise) throw new Error("Sign-in isn't configured yet.");
  const [auth, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([
    authPromise,
    import("firebase/auth"),
  ]);
  await signInWithPopup(auth, new GoogleAuthProvider());
}
