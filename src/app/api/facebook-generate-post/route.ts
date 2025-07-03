import { NextResponse } from 'next/server';
import { generateAdCopy } from '@/ai/flows/generate-ad-copy';

export async function POST(request: Request) {
  try {
    const { car } = await request.json();
    if (!car) {
      return NextResponse.json({ error: 'Missing car data.' }, { status: 400 });
    }
    // Use the AI flow to generate ad copy
    const adCopy = await generateAdCopy(car);
    return NextResponse.json({ postText: adCopy.adCopy });
  } catch (error) {
    console.error('Error generating Facebook post text:', error);
    return NextResponse.json({ error: 'Failed to generate post text.' }, { status: 500 });
  }
} 