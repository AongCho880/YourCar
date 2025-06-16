
import { NextResponse } from 'next/server';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import admin from '@/lib/firebaseAdmin'; // Import Firebase Admin SDK
import type { AdminContactSettings } from '@/types';

const SETTINGS_DOC_PATH = 'adminSettings/contactDetails';

// GET /api/admin-settings - Fetch admin contact settings (Publicly readable)
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firestore is not initialized.' }, { status: 500 });
    }
    const settingsDocRef = doc(db, SETTINGS_DOC_PATH);
    const settingsSnap = await getDoc(settingsDocRef);

    if (!settingsSnap.exists()) {
      return NextResponse.json({ whatsappNumber: '', messengerId: '' });
    }
    
    const settingsData = settingsSnap.data() as AdminContactSettings;
    const responseData = {
      ...settingsData,
      updatedAt: settingsData.updatedAt && typeof settingsData.updatedAt === 'object' && 'seconds' in settingsData.updatedAt
        // @ts-ignore
        ? (settingsData.updatedAt.seconds * 1000 + settingsData.updatedAt.nanoseconds / 1000000) 
        : settingsData.updatedAt,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch admin settings', details: errorMessage }, { status: 500 });
  }
}

// POST /api/admin-settings - Update admin contact settings (Secured for Admin)
export async function POST(request: Request) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token.' }, { status: 401 });
    }
    const token = authorizationHeader.split('Bearer ')[1];

    if (!admin.apps.length) {
      return NextResponse.json({ error: 'Firebase Admin SDK not initialized on server.' }, { status: 500 });
    }
    
    try {
      await admin.auth().verifyIdToken(token);
      // console.log('Authenticated user for admin settings update:', decodedToken.uid);
    } catch (authError) {
      console.error('Firebase ID token verification failed for admin settings update:', authError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 403 });
    }

    // Token is valid, proceed with updating settings
    if (!db) {
      return NextResponse.json({ error: 'Firestore is not initialized.' }, { status: 500 });
    }
    const { whatsappNumber, messengerId } = await request.json() as Partial<AdminContactSettings>;

    if (typeof whatsappNumber === 'undefined' && typeof messengerId === 'undefined') {
        return NextResponse.json({ error: 'At least one setting (whatsappNumber or messengerId) must be provided.' }, { status: 400 });
    }
    
    const settingsDocRef = doc(db, SETTINGS_DOC_PATH);
    const dataToSave: Partial<AdminContactSettings> = { // Use Partial for serverTimestamp compatibility
        ...(whatsappNumber !== undefined && { whatsappNumber }),
        ...(messengerId !== undefined && { messengerId }),
        // @ts-ignore Firestore serverTimestamp type
        updatedAt: serverTimestamp(), 
    };

    await setDoc(settingsDocRef, dataToSave, { merge: true });

    // Fetch the newly saved data to return it accurately
    const updatedSnap = await getDoc(settingsDocRef);
    const updatedData = updatedSnap.data();
    
    return NextResponse.json({ 
      message: 'Admin settings updated successfully.', 
      // @ts-ignore
      whatsappNumber: updatedData?.whatsappNumber || '', 
      // @ts-ignore
      messengerId: updatedData?.messengerId || '',
      // @ts-ignore
      updatedAt: updatedData?.updatedAt?.toMillis ? updatedData.updatedAt.toMillis() : Date.now() 
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating admin settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update admin settings', details: errorMessage }, { status: 500 });
  }
}
