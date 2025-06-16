
import { NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin'; // Import Firebase Admin SDK

// Firebase Storage related imports are not needed if functionality is disabled
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { storage } from '@/lib/firebaseConfig'; // Storage is not initialized here

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
      // console.log('Authenticated user for upload:', decodedToken.uid); // Optional: log UID
    } catch (authError) {
      console.error('Firebase ID token verification failed for upload:', authError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 403 });
    }

    // Token is valid, but functionality is disabled
    console.warn("Image upload API called by authenticated user, but direct Firebase Storage integration is currently disabled by the administrator.");
    return NextResponse.json(
      { 
        error: 'Image upload functionality is currently disabled.',
        message: 'Please use externally hosted image URLs and add them manually in the form.' 
      }, 
      { status: 503 } // 503 Service Unavailable
    );

    // --- PREVIOUS CODE FOR ACTUAL UPLOAD (KEPT FOR REFERENCE IF RE-ENABLING) ---
    /*
    if (!storage) { // This check would fail as storage is not initialized in firebaseConfig
      return NextResponse.json({ error: 'Firebase Storage is not initialized or configured.' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }
    
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `car_images/${Date.now()}-${safeFileName}`;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, fileBuffer, { contentType: file.type });
    
    await uploadTask; 
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    return NextResponse.json({ imageUrl: downloadURL }, { status: 201 });
    */
    // --- END OF PREVIOUS CODE ---

  } catch (error) {
    console.error('Error in upload API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: 'Failed to process upload request', details: errorMessage }, { status: 500 });
  }
}
