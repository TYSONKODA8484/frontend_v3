"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { getMe } from "@/lib/api/auth";
import type { MeResponse } from "@/lib/types/auth";

type AuthContextValue = {
  firebaseUser: User | null;
  profile: MeResponse | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(() => auth != null);

  useEffect(() => {
    if (!auth) return;
    // `loading` tracks only Firebase resolving sign-in state — it does not
    // wait on the backend profile fetch below, so consumers that only need
    // to know "signed in or not" (route guards, team/billing fetches that
    // only need a valid ID token) aren't stuck behind an extra round trip.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
      if (!user) {
        setProfile(null);
        return;
      }
      user
        .getIdToken()
        .then(getMe)
        .then(setProfile)
        .catch(() => setProfile(null));
    });
    return unsubscribe;
  }, []);

  async function signOut() {
    if (!auth) return;
    await firebaseSignOut(auth);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
