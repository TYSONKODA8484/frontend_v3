import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export async function signInWithGoogle(): Promise<void> {
  if (!auth) throw new Error("Sign-in isn't configured yet.");
  await signInWithPopup(auth, new GoogleAuthProvider());
}
