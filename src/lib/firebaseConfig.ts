
// src/lib/firebaseConfig.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// These variables are expected to be set in your .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

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
}

if (getApps().length === 0) {
  if (missingKeys.length === 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    console.warn("Firebase could not be initialized due to missing configuration.");
    // @ts-expect-error Assigning null to satisfy TypeScript if config is missing
    app = null;
    // @ts-expect-error
    db = null;
    // @ts-expect-error
    storage = null;
  }
} else {
  app = getApps()[0];
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, db, storage };
