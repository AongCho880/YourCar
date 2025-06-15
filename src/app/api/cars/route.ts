
import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import type { Car } from '@/types';

// GET /api/cars - Fetch all cars
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firestore is not initialized.' }, { status: 500 });
    }
    const carsCollection = collection(db, 'cars');
    const q = query(carsCollection, orderBy('createdAt', 'desc'));
    const carSnapshot = await getDocs(q);
    const carsList = carSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to numbers (milliseconds)
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt,
      } as Car;
    });
    return NextResponse.json(carsList);
  } catch (error) {
    console.error('Error fetching cars:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch cars', details: errorMessage }, { status: 500 });
  }
}

// POST /api/cars - Create a new car
export async function POST(request: Request) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Firestore is not initialized.' }, { status: 500 });
    }
    const carData = await request.json() as Omit<Car, 'id' | 'createdAt' | 'updatedAt'>;
    
    const now = Timestamp.now();
    const newCarData = {
      ...carData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'cars'), newCarData);
    
    const createdCar: Car = {
      id: docRef.id,
      ...carData,
      createdAt: newCarData.createdAt.toMillis(),
      updatedAt: newCarData.updatedAt.toMillis(),
    };
    return NextResponse.json(createdCar, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create car', details: errorMessage }, { status: 500 });
  }
}
