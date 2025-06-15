
import { NextResponse } from 'next/server';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebaseConfig';
import { Readable } from 'stream';

export async function POST(request: Request) {
  try {
    if (!storage) {
      return NextResponse.json({ error: 'Firebase Storage is not initialized.' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }
    
    // Convert File to Buffer for uploadBytesResumable
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const fileName = `car_images/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, fileName);

    // Metadata can be added if needed, e.g., { contentType: file.type }
    const uploadTask = uploadBytesResumable(storageRef, fileBuffer, { contentType: file.type });

    // Wait for the upload to complete
    await uploadTask;

    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    return NextResponse.json({ imageUrl: downloadURL }, { status: 201 });

  } catch (error) {
    console.error('Error uploading image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to upload image', details: errorMessage }, { status: 500 });
  }
}
