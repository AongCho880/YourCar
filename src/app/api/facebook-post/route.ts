import { NextResponse } from 'next/server';

const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

async function uploadPhotoToFacebook(imageUrl: string) {
  const res = await fetch(`https://graph.facebook.com/${PAGE_ID}/photos?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: imageUrl, published: false })
    }
  );
  const data = await res.json();
  if (!res.ok || !data.id) throw new Error(data.error?.message || 'Failed to upload image');
  return data.id;
}

export async function POST(request: Request) {
  try {
    if (!PAGE_ACCESS_TOKEN || !PAGE_ID) {
      return NextResponse.json({ error: 'Facebook Page credentials not set.' }, { status: 500 });
    }
    const { postText, images } = await request.json();
    if (!postText || !images || !Array.isArray(images)) {
      return NextResponse.json({ error: 'Missing postText or images.' }, { status: 400 });
    }
    // Upload images to Facebook (unpublished)
    let attached_media = [];
    for (const img of images) {
      const photoId = await uploadPhotoToFacebook(img);
      attached_media.push({ media_fbid: photoId });
    }
    // Create the post
    const postRes = await fetch(`https://graph.facebook.com/${PAGE_ID}/feed?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: postText,
          ...(attached_media.length > 0 ? { attached_media } : {})
        })
      }
    );
    const postData = await postRes.json();
    if (!postRes.ok || !postData.id) {
      throw new Error(postData.error?.message || 'Failed to create Facebook post');
    }
    return NextResponse.json({ success: true, postId: postData.id });
  } catch (error: any) {
    console.error('Error posting to Facebook:', error);
    return NextResponse.json({ error: error.message || 'Failed to post to Facebook.' }, { status: 500 });
  }
} 