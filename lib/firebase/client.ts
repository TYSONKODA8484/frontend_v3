import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Pure env check — no firebase import needed, so this stays synchronous and
 * costs nothing in the initial bundle regardless of which page loads it.
 */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let authPromise: Promise<Auth> | null = null;

/**
 * The firebase SDK (~144KB across its app+auth chunks) used to load
 * synchronously on every page via AuthContext in the root layout —
 * including the signed-out marketing homepage, which most visitors never
 * need it on. Deferred behind a dynamic import so those bytes only
 * download once this is actually called (from AuthContext's effect, after
 * first paint), not as part of the page's initial JS. Memoized so every
 * consumer (AuthContext, google-sign-in, the callback/invite pages) shares
 * one in-flight/resolved instance instead of re-importing.
 */
export function getFirebaseAuth(): Promise<Auth> | null {
  if (!isFirebaseConfigured) return null;
  if (!authPromise) {
    authPromise = Promise.all([import("firebase/app"), import("firebase/auth")]).then(
      ([{ initializeApp, getApps, getApp }, { getAuth }]) => {
        const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
        return getAuth(app);
      },
    );
  }
  return authPromise;
}
