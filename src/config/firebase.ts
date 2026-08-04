// Firebase & Cloud Firestore Configuration for Petaca
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const hasEnvProjectId = Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);
const hasEnvApiKey = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForPetacaApp2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "petaca-inventory.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "petaca-inventory",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "petaca-inventory.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475610:web:abcdef123456789"
};

import { getStorage } from 'firebase/storage';

// Console Log Statements to verify credential source
if (hasEnvProjectId && hasEnvApiKey) {
  console.log(
    `🔥 [Firebase Config] Loaded credentials from environment variables (.env):`,
    {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      apiKey: `${firebaseConfig.apiKey.slice(0, 6)}...`
    }
  );
} else {
  console.warn(
    `⚠️ [Firebase Config] No environment variables found in .env (VITE_FIREBASE_*). Using fallback demo credentials for project: "${firebaseConfig.projectId}".`
  );
}

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore & Firebase Storage instances
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

