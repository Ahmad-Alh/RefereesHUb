import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { getMediaFile } from '@/lib/media-store'

export const dynamic = 'force-dynamic'

// GET /api/media/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const media = getMediaFile(params.id)

  if (!media) {
    return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
  }

  let bytes: Buffer
  try {
    bytes = await fs.readFile(media.filePath)
  } catch {
    return NextResponse.json({ error: 'تعذّر قراءة الملف' }, { status: 410 })
  }

  return new NextResponse(bytes, {
    headers: {
      'Content-Type': media.mimeType,
      'Content-Length': String(media.size),
      'Content-Disposition': `inline; filename="${encodeURIComponent(media.fileName)}"`,
      'Cache-Control': 'no-store',
    },
  })
}
