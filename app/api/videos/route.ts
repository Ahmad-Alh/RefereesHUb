import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const difficulty = searchParams.get('difficulty')
    const position = searchParams.get('position')
    const lawId = searchParams.get('lawId')
    const controversial = searchParams.get('controversial')

    const where: Record<string, unknown> = {
      isPublished: true,
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (position) {
      where.position = position
    }

    if (controversial === 'true') {
      where.isControversial = true
    }

    if (lawId) {
      where.laws = {
        some: {
          lawId: parseInt(lawId),
        },
      }
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        laws: {
          select: { lawId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الفيديوهات' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const {
      titleAr,
      titleEn,
      descriptionAr,
      descriptionEn,
      url,
      thumbnailUrl,
      difficulty,
      position,
      isControversial,
      lawIds,
    } = body

    const video = await prisma.video.create({
      data: {
        titleAr,
        titleEn,
        descriptionAr,
        descriptionEn,
        url,
        thumbnailUrl,
        difficulty: difficulty || 'BEGINNER',
        position: position || 'ALL',
        isControversial: isControversial || false,
        uploadedById: session.user.id,
        laws: {
          create: lawIds?.map((lawId: number) => ({ lawId })) || [],
        },
      },
      include: {
        laws: true,
      },
    })

    return NextResponse.json({ video })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الفيديو' },
      { status: 500 }
    )
  }
}
