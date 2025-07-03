import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Complaint } from '@/types';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// POST /api/complaints - Create a new complaint
export async function POST(request: Request) {
  try {
    const complaintData = await request.json() as Omit<Complaint, 'id' | 'submittedAt'>;

    const newComplaintData = {
      ...complaintData,
      is_resolved: false, // Default to not resolved
      submitted_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('complaints')
      .insert([newComplaintData])
      .select();

    if (error) {
      console.error('Error adding complaint:', error);
      return NextResponse.json({ error: 'Failed to add complaint' }, { status: 500 });
    }

    const addedComplaint = data[0];

    const createdComplaint: Complaint = {
      ...addedComplaint,
      id: addedComplaint.id.toString(),
      submittedAt: addedComplaint.submitted_at,
      isResolved: addedComplaint.is_resolved,
    };
    return NextResponse.json(createdComplaint, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create complaint', details: errorMessage }, { status: 500 });
  }
} 