
// src/lib/firebaseConfig.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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

const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket', // Now required for storage
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(`Firebase configuration is missing the following keys: ${missingKeys.join(', ')}. Firebase app NOT fully initialized.`);
  // App might still initialize for some services if only a few keys are missing,
  // but dependent services like Firestore/Storage will fail.
}

if (getApps().length === 0) {
  if (missingKeys.length === 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase app, Firestore, and Storage initialized.");
  } else {
    // Fallback for app if essential keys are missing, but db/storage will be undefined
    // This state should ideally not be reached if checks are done before using db/storage
    app = initializeApp({}); // Minimal init to avoid crashes if 'app' is expected
    console.warn("Firebase app initialized with partial/missing config. Firestore/Storage will not be available.");
  }
} else {
  app = getApps()[0];
  // Ensure db and storage are initialized if app was already initialized
  // This can happen with HMR in development
  try {
    db = getFirestore(app);
  } catch (e) {
    console.error("Failed to initialize Firestore on HMR, missing config?", e);
  }
  try {
    storage = getStorage(app);
  } catch (e) {
    console.error("Failed to initialize Storage on HMR, missing config?", e);
  }
}

export { app, db, storage };
