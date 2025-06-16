
import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebaseConfig'; // client SDK
import admin from '@/lib/firebaseAdmin'; // Admin SDK
import type { Car } from '@/types';

// GET /api/cars/[id] - Fetch a single car
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!db) {
      return NextResponse.json({ error: 'Firestore is not initialized.' }, { status: 500 });
    }
    const carDocRef = doc(db, 'cars', id);
    const carSnap = await getDoc(carDocRef);

    if (!carSnap.exists()) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const carData = carSnap.data() as Omit<Car, 'id'>;
    const responseCar: Car = {
      id: carSnap.id,
      ...carData,
      createdAt: carData.createdAt instanceof Timestamp ? carData.createdAt.toMillis() : carData.createdAt,
      updatedAt: carData.updatedAt instanceof Timestamp ? carData.updatedAt.toMillis() : carData.updatedAt,
    };
    return NextResponse.json(responseCar);
  } catch (error) {
    console.error(`Error fetching car ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch car', details: errorMessage }, { status: 500 });
  }
}

// PUT /api/cars/[id] - Update a car (Not secured with token in this example, uses client-side context for updates)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Note: Car updates are now handled client-side directly via CarContext
  // This API route could be secured similarly to DELETE if needed for other purposes.
  try {
    const { id } = params;
    if (!db) {
      return NextResponse.json({ error: 'Firestore is not initialized.' }, { status: 500 });
    }
    const carData = await request.json() as Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>>;
    
    const carDocRef = doc(db, 'cars', id);
    const carSnap = await getDoc(carDocRef);
    if (!carSnap.exists()) {
      return NextResponse.json({ error: 'Car not found, cannot update.' }, { status: 404 });
    }

    const updatedCarData = {
      ...carData,
      updatedAt: Timestamp.now(), // Use server timestamp for accuracy
    };

    await updateDoc(carDocRef, updatedCarData);
    const updatedSnap = await getDoc(carDocRef);
    const returnedData = updatedSnap.data() as Omit<Car, 'id'>;
    const responseCar: Car = {
      id: updatedSnap.id,
      ...returnedData,
      createdAt: returnedData.createdAt instanceof Timestamp ? returnedData.createdAt.toMillis() : returnedData.createdAt,
      updatedAt: returnedData.updatedAt instanceof Timestamp ? returnedData.updatedAt.toMillis() : returnedData.updatedAt,
    };
    return NextResponse.json(responseCar, { status: 200 });
  } catch (error) {
    console.error(`Error updating car ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update car', details: errorMessage }, { status: 500 });
  }
}

// DELETE /api/cars/[id] - Delete a car (Secured with Firebase ID Token)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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
      // Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      // Optional: You can check decodedToken.uid for specific admin UIDs if needed
      console.log('Authenticated user for delete:', decodedToken.uid); 
    } catch (authError) {
      console.error('Firebase ID token verification failed:', authError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 403 });
    }

    // Token is valid, proceed with deletion
    const { id } = params;
    if (!db || !storage) {
      return NextResponse.json({ error: 'Firestore or Storage is not initialized (client SDK instances).' }, { status: 500 });
    }
    
    const carDocRef = doc(db, 'cars', id);
    const carSnap = await getDoc(carDocRef);

    if (!carSnap.exists()) {
      return NextResponse.json({ error: 'Car not found, cannot delete.' }, { status: 404 });
    }

    const carData = carSnap.data() as Car;

    if (carData.images && carData.images.length > 0) {
      const deletePromises = carData.images.map(imageUrl => {
        try {
          const decodedUrl = decodeURIComponent(imageUrl);
          const pathStartIndex = decodedUrl.indexOf('/o/') + 3;
          const pathEndIndex = decodedUrl.indexOf('?alt=media');
          if (pathStartIndex > 2 && pathEndIndex > -1) {
            const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex);
            const imageRef = ref(storage, filePath);
            return deleteObject(imageRef).catch(err => {
              console.warn(`Failed to delete image ${imageUrl} from Storage:`, err.message);
            });
          } else {
            console.warn(`Could not parse file path from image URL: ${imageUrl}`);
            return Promise.resolve();
          }
        } catch (e) {
           console.warn(`Error processing image URL ${imageUrl} for deletion:`, e instanceof Error ? e.message : e);
           return Promise.resolve();
        }
      });
      await Promise.all(deletePromises);
    }

    await deleteDoc(carDocRef);

    return NextResponse.json({ message: `Car ${id} and associated images deleted successfully.` }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting car ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete car', details: errorMessage }, { status: 500 });
  }
}
