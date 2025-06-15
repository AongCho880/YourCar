
// src/lib/firebaseConfig.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
// Firestore and Storage imports are removed as they are no longer used by the reverted contexts

// These variables would be read from your .env.local file if Firebase was being used.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined; // Changed to allow undefined if config is missing or not used

// Check if all required Firebase config values are present
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  // storageBucket is not strictly needed if only using e.g. auth, but good to keep for completeness
  // 'storageBucket', 
  // 'messagingSenderId',
  // 'appId',
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (getApps().length === 0) {
  if (missingKeys.length === 0) {
    // Only initialize if essential config is present
    // app = initializeApp(firebaseConfig); 
    // console.log("Firebase app initialized (but db/storage not used by core features anymore).");
    // For a full revert where app itself is not used, we can even skip initialization
    // or leave it commented out if no other Firebase service (like Auth) is intended.
  } else {
    // console.warn(`Firebase configuration is missing the following keys: ${missingKeys.join(', ')}. Firebase app NOT initialized.`);
  }
} else {
  // app = getApps()[0];
}

// db and storage are no longer exported or initialized here.
// export { app }; // Export 'app' if any other part of the project (e.g., potential Firebase Auth) might need it.
// For a complete revert of DB/Storage, ensure nothing else tries to import 'db' or 'storage' from here.
// If 'app' itself is not used anywhere, this file can be left very minimal or even cleared.
// For now, let's make it so it doesn't error if NEXT_PUBLIC_ vars are missing, and doesn't export anything.

export { app }; // Keep app export in case it was used, but it won't be initialized if config is missing.
// To make it truly "before Firebase setup" for db/storage, db and storage are removed.
// The core app features (cars, settings) no longer depend on this file for db/storage.
