
import { NextResponse } from 'next/server';
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { storage } from '@/lib/firebaseConfig'; // Storage is no longer initialized here

export async function POST(request: Request) {
  // Firebase Storage functionality is currently disabled.
  // To enable, uncomment the storage related code in this file and in src/lib/firebaseConfig.ts,
  // and ensure Firebase Storage is set up in your Firebase project.
  console.warn("Image upload API called, but Firebase Storage integration is disabled.");
  return NextResponse.json({ error: 'Image upload functionality is currently disabled by the administrator.' }, { status: 503 }); // 503 Service Unavailable

  /*
  // --- CODE TO RE-ENABLE IF STORAGE IS SET UP ---
  // if (!storage) {
  //   return NextResponse.json({ error: 'Firebase Storage is not initialized or configured.' }, { status: 500 });
  // }

  // try {
  //   const formData = await request.formData();
  //   const file = formData.get('file') as File | null;

  //   if (!file) {
  //     return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  //   }

  //   if (!file.type.startsWith('image/')) {
  //     return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
  //   }
    
  //   const fileBuffer = Buffer.from(await file.arrayBuffer());
  //   const fileName = `car_images/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  //   const storageRef = ref(storage, fileName);

  //   const uploadTask = uploadBytesResumable(storageRef, fileBuffer, { contentType: file.type });
  //   await uploadTask;
  //   const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

  //   return NextResponse.json({ imageUrl: downloadURL }, { status: 201 });

  // } catch (error) {
  //   console.error('Error uploading image:', error);
  //   const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  //   return NextResponse.json({ error: 'Failed to upload image', details: errorMessage }, { status: 500 });
  // }
  // --- END OF CODE TO RE-ENABLE ---
  */
}
