
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    
    if (serviceAccountBase64) {
      const serviceAccountJsonString = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(serviceAccountJsonString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Add your databaseURL and storageBucket if you intend to use Admin SDK for those too
        // databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
        // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      console.log('Firebase Admin SDK initialized with Base64 service account.');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // If FIREBASE_SERVICE_ACCOUNT_BASE64 is not set,
      // Firebase Admin SDK will try to use GOOGLE_APPLICATION_CREDENTIALS automatically.
      admin.initializeApp();
      console.log('Firebase Admin SDK initialized with GOOGLE_APPLICATION_CREDENTIALS.');
    } else {
        console.warn(
        'Firebase Admin SDK not initialized. Missing FIREBASE_SERVICE_ACCOUNT_BASE64 or GOOGLE_APPLICATION_CREDENTIALS environment variable.'
      );
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
  }
}

export default admin;
