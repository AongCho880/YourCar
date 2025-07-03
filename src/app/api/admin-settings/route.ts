import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { AdminContactSettings } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL and Service Role Key are required.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// GET /api/admin-settings - Fetch admin contact settings (Publicly readable)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('whatsapp_number, messenger_link, facebook_page_link, updated_at')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found, which is not an error in our case. Return default values.
        return NextResponse.json({ whatsappNumber: '', messengerId: '', facebookPageLink: '' });
      }
      console.error('Error fetching admin settings:', error);
      return NextResponse.json({ error: 'Failed to fetch admin settings', details: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ whatsappNumber: '', messengerId: '', facebookPageLink: '' });
    }

    return NextResponse.json({
      whatsappNumber: data.whatsapp_number,
      messengerId: data.messenger_link,
      facebookPageLink: data.facebook_page_link,
      updatedAt: data.updated_at
    });
  } catch (error) {
    console.error('Error in GET /api/admin-settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch admin settings', details: errorMessage }, { status: 500 });
  }
}

// POST /api/admin-settings - Update admin contact settings (Secured for Admin)
export async function POST(request: Request) {
  try {
    const authorizationHeader = request.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token.' }, { status: 401 });
    }
    const token = authorizationHeader.split('Bearer ')[1];

    // Verify the token using Supabase Admin
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !userData?.user) {
      console.error('Supabase authentication failed for admin settings update:', authError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 403 });
    }

    // Token is valid, proceed with updating settings
    const { whatsappNumber, messengerId, facebookPageLink } = (await request.json()) as Partial<AdminContactSettings>;

    if (typeof whatsappNumber === 'undefined' && typeof messengerId === 'undefined' && typeof facebookPageLink === 'undefined') {
      return NextResponse.json(
        { error: 'At least one setting (whatsappNumber, messengerId, or facebookPageLink) must be provided.' },
        { status: 400 }
      );
    }

    const dataToSave = {
      ...(whatsappNumber !== undefined && { whatsapp_number: whatsappNumber }),
      ...(messengerId !== undefined && { messenger_link: messengerId }),
      ...(facebookPageLink !== undefined && { facebook_page_link: facebookPageLink }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .update(dataToSave)
      .eq('id', 1) // Assuming a single row for admin settings with ID 1
      .select();

    if (error) {
      console.error('Error updating admin settings:', error);
      return NextResponse.json({ error: 'Failed to update admin settings', details: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Failed to update admin settings: No record found or updated.' }, { status: 404 });
    }

    const updatedSettings = data[0];

    return NextResponse.json(
      {
        message: 'Admin settings updated successfully.',
        whatsappNumber: updatedSettings.whatsapp_number || '',
        messengerId: updatedSettings.messenger_link || '',
        facebookPageLink: updatedSettings.facebook_page_link || '',
        updatedAt: updatedSettings.updated_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating admin settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update admin settings', details: errorMessage }, { status: 500 });
  }
}
