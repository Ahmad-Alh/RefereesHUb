import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Public: GET a single PUBLISHED video
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const video = await prisma.video.findUnique({
      where: { id, isPublished: true },
      include: {
        laws: { select: { lawId: true } },
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json({ error: 'فشل في جلب الفيديو' }, { status: 500 })
  }
}
