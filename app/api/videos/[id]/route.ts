import { NextRequest, NextResponse } from 'next/server'
import { getVideoById } from '@/lib/video-store'

export const dynamic = 'force-dynamic'

// Public: get a single published video
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const video = getVideoById(params.id)

  if (!video || !video.isPublished) {
    return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ video })
}
