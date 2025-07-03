import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  try {
    // Extract and validate authorization token from request headers
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token.' }, { status: 401 });
    }
    const token = authorizationHeader.split('Bearer ')[1];

    // Verify the user's authentication token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Supabase token verification failed for upload:', authError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 403 });
    }

    // Parse form data to get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validate that the uploaded file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Convert file to buffer for upload
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    // Sanitize filename to prevent security issues
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    // Create unique filename with timestamp to prevent conflicts
    const fileName = `car_images/${Date.now()}-${safeFileName}`;

    // Upload file to Supabase storage bucket
    const { data, error: uploadError } = await supabase.storage
      .from('car-images') // Make sure this bucket exists and has correct policies
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image.', details: uploadError.message }, { status: 500 });
    }

    // Generate public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(data.path);

    return NextResponse.json({ imageUrl: publicUrl }, { status: 201 });

  } catch (error) {
    console.error('Error in upload API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: 'Failed to process upload request', details: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE endpoint for removing individual images from Supabase storage
 * This endpoint is called when users want to delete a specific image from the car form
 */
export async function DELETE(request: Request) {
  try {
    // Extract and validate authorization token from request headers
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token.' }, { status: 401 });
    }
    const token = authorizationHeader.split('Bearer ')[1];

    // Verify the user's authentication token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Supabase token verification failed for delete:', authError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 403 });
    }

    // Extract the image URL to delete from request body
    const { urlToDelete } = await request.json();

    // Validate that a valid URL was provided
    if (!urlToDelete || typeof urlToDelete !== 'string') {
      return NextResponse.json({ error: 'Image URL to delete was not provided.' }, { status: 400 });
    }

    // Define the storage bucket name
    const bucketName = 'car-images';

    // Parse the Supabase storage URL to extract the file path
    // Expected format: https://<project-id>.supabase.co/storage/v1/object/public/car-images/<filename>
    const urlParts = urlToDelete.split(`/${bucketName}/`);

    if (urlParts.length < 2) {
      return NextResponse.json({ error: 'Invalid Supabase storage URL format.' }, { status: 400 });
    }

    // Extract the file path from the URL (everything after the bucket name)
    const imagePath = urlParts[1];

    // Delete the file from Supabase storage using the remove method
    // The remove method takes an array of file paths to delete
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([imagePath]);

    if (deleteError) {
      console.error('Supabase storage delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete image from storage.', details: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Image deleted successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in delete image API route:', error);
    const errorMessage = error.message || 'Unknown server error during image deletion.';
    return NextResponse.json({ error: 'Failed to process delete request', details: errorMessage }, { status: 500 });
  }
}
