import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import type { Car } from '@/types';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// GET /api/cars - Fetch all cars
export async function GET() {
  try {

    const { data, error } = await supabaseAdmin
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cars:', error);
      return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
    }

    const carsList = data.map(car => ({
      ...car,
      id: car.id.toString(),
      createdAt: car.created_at,
      updatedAt: car.created_at,
      features: car.features ? car.features
        .filter((feature: any) => feature !== null && feature !== undefined)
        .map((feature: any) =>
          typeof feature === 'string' ? { value: feature } : feature
        ) : [],
    })) as Car[];
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

    const carData = await request.json() as Omit<Car, 'id' | 'createdAt' | 'updatedAt'>;

    // Transform features from objects to strings for database storage
    const transformedFeatures = carData.features ? carData.features
      .filter(f => f && f.value)
      .map(f => f.value) : [];

    const newCarData = {
      ...carData,
      features: transformedFeatures,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('cars')
      .insert([newCarData])
      .select();

    if (error) {
      console.error('Error adding car:', error);
      return NextResponse.json({ error: 'Failed to add car' }, { status: 500 });
    }

    const addedCar = data[0];

    const createdCar: Car = {
      ...addedCar,
      id: addedCar.id.toString(),
      createdAt: addedCar.created_at,
      updatedAt: addedCar.created_at,
      features: addedCar.features ? addedCar.features
        .filter((feature: any) => feature !== null && feature !== undefined)
        .map((feature: any) =>
          typeof feature === 'string' ? { value: feature } : feature
        ) : [],
    };
    return NextResponse.json(createdCar, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create car', details: errorMessage }, { status: 500 });
  }
}
