import { NextRequest, NextResponse } from 'next/server'
import { getMediaFile } from '@/lib/media-store'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const media = getMediaFile(params.id)

  if (!media) {
    return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
  }

  const buffer = Buffer.from(media.bytesBase64, 'base64')

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': media.mimeType,
      'Content-Length': String(buffer.length),
      'Content-Disposition': `inline; filename="${encodeURIComponent(media.fileName)}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
