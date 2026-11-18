// Firebase & Cloud Firestore Configuration for Petaca
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously, User } from 'firebase/auth';

const hasEnvProjectId = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);
const hasEnvApiKey = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);
export const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForPetacaApp2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "petaca-inventory.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "petaca-inventory",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "petaca-inventory.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475610:web:abcdef123456789"
};

// Console Log Statements to verify credential source
if (hasEnvProjectId && hasEnvApiKey) {
  console.log(
    `🔥 [Firebase Config] Loaded credentials from environment variables (.env):`,
    {
      projectId: firebaseConfig.projectId,
      databaseId,
      authDomain: firebaseConfig.authDomain,
      apiKey: `${firebaseConfig.apiKey.slice(0, 6)}...`
    }
  );
} else {
  console.warn(
    `⚠️ [Firebase Config] No environment variables found in .env (VITE_FIREBASE_*). Using fallback demo credentials for project: "${firebaseConfig.projectId}" (DB: "${databaseId}").`
  );
}

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth, Cloud Firestore & Firebase Storage instances
export const auth = getAuth(app);
export const db = getFirestore(app, databaseId);
export const storage = getStorage(app);

let authPromise: Promise<User | null> | null = null;

/**
 * Automatically sign in anonymously so Firestore rules requiring `request.auth != null` succeed.
 */
export const ensureAnonymousAuth = (): Promise<User | null> => {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }
  if (!authPromise) {
    authPromise = signInAnonymously(auth)
      .then((cred) => {
        console.log(`🔐 [Firebase Auth] Signed in anonymously (uid: ${cred.user.uid})`);
        return cred.user;
      })
      .catch((err) => {
        authPromise = null;
        console.error(`❌ [Firebase Auth Error] Anonymous sign-in failed:`, err);
        throw err;
      });
  }
  return authPromise;
};

export default app;

