import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import type { Car } from '@/types';

// Initialize Supabase Admin Client with service role key for elevated permissions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const carId = params.id;

  try {
    // 1. Verify User Authentication
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication token not provided.' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication failed. Invalid token.' }, { status: 403 });
    }

    // 2. Get the car data from request body
    const carData = await req.json() as Omit<Car, 'id' | 'createdAt' | 'updatedAt'>;

    // 3. Map camelCase to snake_case for database
    const updateData = {
      make: carData.make,
      model: carData.model,
      year: carData.year,
      price: carData.price,
      mileage: carData.mileage,
      condition: carData.condition,
      features: carData.features ? carData.features
        .filter(f => f && f.value)
        .map(f => f.value) : [],
      images: carData.images,
      description: carData.description,
      isSold: carData.isSold,
    };

    // 4. Update the car in the database
    const { data, error } = await supabaseAdmin
      .from('cars')
      .update(updateData)
      .eq('id', carId)
      .select();

    if (error) {
      console.error('Error updating car:', error);
      return NextResponse.json({ error: 'Failed to update car.' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Car not found.' }, { status: 404 });
    }

    // 5. Map snake_case back to camelCase for response
    const updatedCar: Car = {
      ...data[0],
      id: data[0].id.toString(),
      createdAt: data[0].created_at,
      updatedAt: data[0].created_at,
      isSold: data[0].isSold,
      features: data[0].features ? data[0].features
        .filter((feature: any) => feature !== null && feature !== undefined)
        .map((feature: any) =>
          typeof feature === 'string' ? { value: feature } : feature
        ) : [],
    };

    return NextResponse.json(updatedCar, { status: 200 });

  } catch (error: any) {
    console.error('Unexpected error in PUT /api/cars/[id]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}

/**
 * DELETE endpoint for removing a car and all its associated images from Supabase storage
 * This endpoint handles bulk deletion of all images when a car is deleted
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const carId = params.id;

  try {
    // 1. Verify User Authentication
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication token not provided.' }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication failed. Invalid token.' }, { status: 403 });
    }

    // 2. Get Car Details to Find Image Paths
    // We need to fetch the car's images before deleting the record so we can clean up storage
    const { data: car, error: fetchError } = await supabaseAdmin
      .from('cars')
      .select('images')
      .eq('id', carId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // PostgREST error for no rows found
        return NextResponse.json({ error: 'Car not found.' }, { status: 404 });
      }
      console.error('Error fetching car for deletion:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch car details.' }, { status: 500 });
    }

    // 3. Delete Images from Supabase Storage
    if (car.images && car.images.length > 0) {
      const imagePaths: string[] = [];

      // Process each image URL to extract the file path for deletion
      for (const url of car.images) {
        try {
          // Handle different URL formats that might be stored in the database
          let path: string;

          if (url.includes('/car-images/')) {
            // Format: https://<project-id>.supabase.co/storage/v1/object/public/car-images/<filename>
            path = url.split('/car-images/')[1];
          } else if (url.includes('/storage/v1/object/public/')) {
            // Format: https://<project-id>.supabase.co/storage/v1/object/public/<bucket>/<filename>
            const parts = url.split('/storage/v1/object/public/');
            if (parts.length > 1) {
              path = parts[1];
            } else {
              console.warn(`Could not extract path from URL: ${url}`);
              continue;
            }
          } else {
            // Try to extract filename from the end of the URL as fallback
            const urlParts = url.split('/');
            const filename = urlParts[urlParts.length - 1];
            if (filename && filename.includes('.')) {
              path = filename;
            } else {
              console.warn(`Could not extract filename from URL: ${url}`);
              continue;
            }
          }

          // Clean up the path by removing any query parameters that might be present
          path = path.split('?')[0];

          if (path) {
            imagePaths.push(path);
            console.log(`Extracted image path: ${path} from URL: ${url}`);
          }
        } catch (error) {
          console.error(`Error processing image URL: ${url}`, error);
        }
      }

      // Delete all extracted image paths from Supabase storage
      if (imagePaths.length > 0) {
        console.log(`Attempting to delete ${imagePaths.length} images from storage:`, imagePaths);

        // Use the remove method to delete multiple files at once
        const { error: storageError } = await supabaseAdmin.storage.from('car-images').remove(imagePaths);

        if (storageError) {
          console.error('Error deleting images from storage:', storageError);
          // Log the error but proceed to delete the database record anyway
          // This ensures the car is deleted even if some images fail to delete
        } else {
          console.log(`Successfully deleted ${imagePaths.length} images from storage`);
        }
      } else {
        console.log('No valid image paths found to delete from storage');
      }
    }

    // 4. Delete the Car Record from the Database
    // This happens after image cleanup to ensure we have the image data
    const { error: deleteError } = await supabaseAdmin
      .from('cars')
      .delete()
      .eq('id', carId);

    if (deleteError) {
      console.error('Error deleting car from database:', deleteError);
      return NextResponse.json({ error: 'Failed to delete car from database.' }, { status: 500 });
    }

    // 5. Return Success Response
    return NextResponse.json({ message: 'Car deleted successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/cars/[id]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
