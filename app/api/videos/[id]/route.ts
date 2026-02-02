import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const video = await prisma.video.findUnique({
      where: { id, isPublished: true },
      include: {
        laws: {
          select: { lawId: true },
        },
      },
    })

    if (!video) {
      return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الفيديو' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const video = await prisma.video.update({
      where: { id },
      data: {
        titleAr: body.titleAr,
        titleEn: body.titleEn,
        descriptionAr: body.descriptionAr,
        descriptionEn: body.descriptionEn,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl,
        difficulty: body.difficulty,
        position: body.position,
        isControversial: body.isControversial,
        isPublished: body.isPublished,
      },
    })

    // Update law associations
    if (body.lawIds) {
      await prisma.videoLaw.deleteMany({ where: { videoId: id } })
      await prisma.videoLaw.createMany({
        data: body.lawIds.map((lawId: number) => ({ videoId: id, lawId })),
      })
    }

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث الفيديو' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params

    await prisma.video.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'فشل في حذف الفيديو' },
      { status: 500 }
    )
  }
}
