
// src/lib/firebaseConfig.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
// import { getStorage, type FirebaseStorage } from "firebase/storage"; // Storage import commented out
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Still present for completeness, but storage service won't be initialized
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;
// let storage: FirebaseStorage; // storage variable commented out
let auth: Auth;

const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  // 'storageBucket', // Storage bucket is not strictly required if storage service is disabled
  'messagingSenderId',
  'appId',
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);
const isStorageBucketMissing = !firebaseConfig['storageBucket'];


if (missingKeys.length > 0) {
  console.error(`Firebase configuration is missing the following keys: ${missingKeys.join(', ')}. Firebase app NOT fully initialized.`);
}
// We can still warn about storage bucket missing, even if we don't initialize the service.
if (isStorageBucketMissing) {
    console.warn("Firebase Storage Bucket (NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) is not configured in your .env.local file. Direct image upload features will be disabled.");
}


if (getApps().length === 0) {
  if (missingKeys.length === 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    // Storage is not initialized
    // if (!isStorageBucketMissing) {
    //   storage = getStorage(app);
    //   console.log("Firebase app, Firestore, Storage, and Auth initialized.");
    // } else {
    //   console.log("Firebase app, Firestore, and Auth initialized. Storage is NOT initialized due to missing bucket config.");
    // }
    console.log("Firebase app, Firestore, and Auth initialized. Storage service is NOT initialized.");

  } else {
    app = initializeApp({}); // Minimal init
    console.warn("Firebase app initialized with partial/missing config. Dependent services (Firestore, Auth) will not be available.");
    // @ts-ignore
    db = undefined;
    // @ts-ignore
    // storage = undefined;
    // @ts-ignore
    auth = undefined;
  }
} else {
  app = getApps()[0];
  try {
    db = getFirestore(app);
  } catch (e) {
    console.error("Failed to re-initialize Firestore, missing config?", e);
    // @ts-ignore
    db = undefined;
  }
  // Storage is not re-initialized
  // try {
  //   if (!isStorageBucketMissing) {
  //      storage = getStorage(app);
  //   } else {
  //      // @ts-ignore
  //      storage = undefined;
  //   }
  // } catch (e) {
  //   console.error("Failed to re-initialize Storage, missing config?", e);
  //   // @ts-ignore
  //   storage = undefined;
  // }
  try {
    auth = getAuth(app);
  } catch (e) {
    console.error("Failed to re-initialize Auth, missing config?", e);
    // @ts-ignore
    auth = undefined;
  }
}

// Only export db and auth, not storage
export { app, db, auth };
// export { app, db, storage, auth }; // Previous export

    