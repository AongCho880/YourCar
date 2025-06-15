
import { NextResponse } from 'next/server';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import type { AdminContactSettings } from '@/types';

const SETTINGS_DOC_PATH = 'adminSettings/contactDetails';

// GET /api/admin-settings - Fetch admin contact settings
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firestore is not initialized.' }, { status: 500 });
    }
    const settingsDocRef = doc(db, SETTINGS_DOC_PATH);
    const settingsSnap = await getDoc(settingsDocRef);

    if (!settingsSnap.exists()) {
      // Return default empty settings if not found, or you can choose to return 404
      return NextResponse.json({ whatsappNumber: '', messengerId: '' });
    }
    
    const settingsData = settingsSnap.data() as AdminContactSettings;
    // Convert Firestore Timestamps if they exist
    const responseData = {
      ...settingsData,
      updatedAt: settingsData.updatedAt && typeof settingsData.updatedAt === 'object' && 'seconds' in settingsData.updatedAt
        // @ts-ignore TODO: Fix Timestamp type issue if serverTimestamp() was used directly before.
        ? (settingsData.updatedAt.seconds * 1000 + settingsData.updatedAt.nanoseconds / 1000000) 
        : settingsData.updatedAt, // if it's already a number or undefined
    };


    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch admin settings', details: errorMessage }, { status: 500 });
  }
}

// POST /api/admin-settings - Update admin contact settings
export async function POST(request: Request) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firestore is not initialized.' }, { status: 500 });
    }
    const { whatsappNumber, messengerId } = await request.json() as Partial<AdminContactSettings>;

    if (typeof whatsappNumber === 'undefined' && typeof messengerId === 'undefined') {
        return NextResponse.json({ error: 'At least one setting (whatsappNumber or messengerId) must be provided.' }, { status: 400 });
    }
    
    const settingsDocRef = doc(db, SETTINGS_DOC_PATH);
    const dataToSave: AdminContactSettings = {
        // Only include fields that are actually passed, or set to empty string if they should be cleared
        ...(whatsappNumber !== undefined && { whatsappNumber }),
        ...(messengerId !== undefined && { messengerId }),
        updatedAt: Date.now(), // Using client-side timestamp for simplicity here
                               // For serverTimestamp(): FieldValue.serverTimestamp() from 'firebase-admin/firestore'
                               // or serverTimestamp() from 'firebase/firestore' if client SDK is used server-side
    };

    await setDoc(settingsDocRef, dataToSave, { merge: true }); // Merge true to not overwrite other fields if any

    return NextResponse.json({ message: 'Admin settings updated successfully.', ...dataToSave }, { status: 200 });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update admin settings', details: errorMessage }, { status: 500 });
  }
}
