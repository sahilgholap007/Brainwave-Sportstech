import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app };

export const auth = getAuth(app);

// Target production Firestore database ID
export const PROD_DB_ID = "(default)";

// Determine target Firestore database ID:
// In production (live deployment domain or production builds), use "(default)".
// On localhost (development), use "(default)".
const getDatabaseId = () => {
  const envDbId = process.env.NEXT_PUBLIC_FIREBASE_DB_ID;

  // Browser check: If on a production/live domain (not localhost), use (default) database
  if (typeof window !== "undefined") {
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (!isLocal) {
      return undefined; // (default) database
    }
  }

  // Server check: In production builds and deployments, use (default) database
  if (process.env.NODE_ENV === "production" && !process.env.FORCE_STAGING_DB) {
    return undefined; // (default) database
  }

  // On localhost in development, if explicitly set to "(default)" or unset, use (default) database
  if (!envDbId || envDbId === "(default)") {
    return undefined;
  }

  return envDbId;
};

const activeDbId = getDatabaseId();
export const db = activeDbId ? getFirestore(app, activeDbId) : getFirestore(app);

// Keep defaultDb aligned with db so any components referencing defaultDb use new-db
export const defaultDb = db;
