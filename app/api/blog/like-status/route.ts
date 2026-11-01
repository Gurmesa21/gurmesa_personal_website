import { NextRequest, NextResponse } from 'next/server';
import { getLikedStatusForUser } from '@/server/services/blogService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ likedByMe: false }, { status: 400 });
  }

  try {
    const likedByMe = await getLikedStatusForUser(postId);
    return NextResponse.json({ likedByMe });
  } catch {
    return NextResponse.json({ likedByMe: false });
  }
}

