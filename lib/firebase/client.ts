import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Firebase validates its config eagerly, so until the real
 * NEXT_PUBLIC_FIREBASE_* values are filled in, `auth` stays null and every
 * consumer treats that as "signed out / auth not configured yet" instead of
 * crashing the app.
 */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;

if (isFirebaseConfigured) {
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(firebaseApp);
}

export { firebaseApp };
export const auth = authInstance;
