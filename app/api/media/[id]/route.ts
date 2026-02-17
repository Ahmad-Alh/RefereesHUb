import { NextRequest, NextResponse } from 'next/server'
import { getMediaFile } from '@/lib/media-store'

export const dynamic = 'force-dynamic'

// GET /api/media/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const media = getMediaFile(params.id)

  if (!media) {
    return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
  }

  const bytes = Buffer.from(media.bytesBase64, 'base64')

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': media.mimeType,
      'Content-Length': String(media.size),
      'Content-Disposition': `inline; filename="${encodeURIComponent(media.fileName)}"`,
      'Cache-Control': 'no-store',
    },
  })
}
