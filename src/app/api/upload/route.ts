
import { NextResponse } from 'next/server';
// Firebase Storage related imports are not needed if functionality is disabled
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { storage } from '@/lib/firebaseConfig'; // Storage is not initialized here

export async function POST(request: Request) {
  console.warn("Image upload API called, but direct Firebase Storage integration is currently disabled by the administrator.");
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

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }
    
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    // Sanitize filename to prevent path traversal or invalid characters in storage path
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `car_images/${Date.now()}-${safeFileName}`;
    const storageRef = ref(storage, fileName);

    // Consider adding metadata like custom metadata or content disposition if needed
    const uploadTask = uploadBytesResumable(storageRef, fileBuffer, { contentType: file.type });
    
    // It's better to await the task to complete fully
    await uploadTask; 
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    return NextResponse.json({ imageUrl: downloadURL }, { status: 201 });

  } catch (error) {
    console.error('Error uploading image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to upload image', details: errorMessage }, { status: 500 });
  }
  */
  // --- END OF PREVIOUS CODE ---
}

    