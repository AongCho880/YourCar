// src/lib/firebaseConfig.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// These variables are expected to be set in your .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId is optional and typically used for Firebase Analytics,
  // which is not currently implemented in this project.
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let db: Firestore;

// Ensure all required Firebase config values are present
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(`Firebase configuration is missing the following keys: ${missingKeys.join(', ')}.`);
  console.error("Please ensure these are set in your .env.local file (e.g., NEXT_PUBLIC_FIREBASE_API_KEY=your_key).");
  // You might want to throw an error here or handle this case more gracefully
  // depending on whether Firebase is critical for all parts of your app at startup.
  // For now, we'll proceed, but Firebase services might fail.
}


if (getApps().length === 0) {
  // Only initialize if all required keys are present, to avoid Firebase errors
  if (missingKeys.length === 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    // Fallback or error state if config is missing
    // This prevents the app from crashing if Firebase isn't configured yet,
    // though features relying on Firebase won't work.
    console.warn("Firebase could not be initialized due to missing configuration.");
    // @ts-expect-error Assigning null to db and app to satisfy TypeScript
    app = null;
    // @ts-expect-error
    db = null;
  }
} else {
  app = getApps()[0];
  db = getFirestore(app);
}


export { app, db };
