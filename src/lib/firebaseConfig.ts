
// src/lib/firebaseConfig.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
// import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

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
// let storage: FirebaseStorage;
let auth: Auth;

const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  // 'storageBucket', // Storage bucket no longer strictly required by this config if storage is disabled
  'messagingSenderId',
  'appId',
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);
const isStorageBucketMissing = !firebaseConfig['storageBucket'];


if (missingKeys.length > 0) {
  console.error(`Firebase configuration is missing the following keys: ${missingKeys.join(', ')}. Firebase app NOT fully initialized.`);
}
if (isStorageBucketMissing) {
    console.warn("Firebase Storage Bucket (NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) is not configured. Direct image upload features will be disabled or may not work as expected.");
}


if (getApps().length === 0) {
  if (missingKeys.length === 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    // if (!isStorageBucketMissing) {
    //   storage = getStorage(app);
    //   console.log("Firebase app, Firestore, Storage, and Auth initialized.");
    // } else {
    //   console.log("Firebase app, Firestore, and Auth initialized. Storage is NOT initialized due to missing bucket config.");
    // }
    console.log("Firebase app, Firestore, and Auth initialized.");

  } else {
    app = initializeApp({}); // Minimal init
    console.warn("Firebase app initialized with partial/missing config. Dependent services will not be available.");
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
  }
  // try {
  //   if (!isStorageBucketMissing) {
  //      storage = getStorage(app);
  //   }
  // } catch (e) {
  //   console.error("Failed to re-initialize Storage, missing config?", e);
  // }
  try {
    auth = getAuth(app);
  } catch (e) {
    console.error("Failed to re-initialize Auth, missing config?", e);
  }
}

export { app, db, auth };
// export { app, db, storage, auth };
