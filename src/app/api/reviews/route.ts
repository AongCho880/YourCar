import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { Review } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// POST /api/reviews - Create a new review
export async function POST(request: Request) {
  try {
    const { ...reviewData }: Partial<Review> = await request.json();
    const { data, error } = await supabaseAdmin.from('reviews').insert([{
      ...reviewData,
      email: reviewData.email || null,
      occupation: reviewData.occupation || null,
      submitted_at: new Date().toISOString()
    }]).select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    const errorMessage = error.message || 'An unknown error occurred';
    console.error('Error creating review:', errorMessage);
    return NextResponse.json({ error: 'Failed to create review', details: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';

    let query = supabaseAdmin
      .from('reviews')
      .select('*')
      .order('submitted_at', { ascending: false });

    // By default, fetch only testimonials unless 'all=true' is specified
    if (!fetchAll) {
      query = query.eq('is_testimonial', true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Map occupation to occupation and email to email
    const mappedData = data.map((r: any) => ({
      ...r,
      occupation: r.occupation,
      email: r.email,
      isTestimonial: r.is_testimonial,
      submittedAt: r.submitted_at,
    }));

    return NextResponse.json(mappedData);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, is_testimonial } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from('reviews')
      .update({ is_testimonial })
      .eq('id', id);
    if (error) {
      throw error;
    }
    return NextResponse.json({ message: 'Review updated successfully' });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 