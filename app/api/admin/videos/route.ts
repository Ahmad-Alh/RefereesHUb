import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function forbidden() {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

// GET /api/admin/videos — list ALL videos (published + draft) for admin
export async function GET() {
  if (!(await requireAdmin())) return forbidden()

  const videos = await prisma.video.findMany({
    include: {
      laws: { select: { lawId: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ videos })
}

// POST /api/admin/videos — create a new video
export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return forbidden()

  try {
    const body = await req.json()
    const {
      titleAr,
      titleEn,
      descriptionAr,
      url,
      thumbnailUrl,
      difficulty,
      position,
      isControversial,
      isPublished,
      tags,
      lawIds,
    } = body

    if (!titleAr?.trim()) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
    }
    if (!url?.trim()) {
      return NextResponse.json({ error: 'رابط الفيديو مطلوب' }, { status: 400 })
    }

    const video = await prisma.video.create({
      data: {
        titleAr: titleAr.trim(),
        titleEn: titleEn?.trim() || null,
        descriptionAr: descriptionAr?.trim() || null,
        url: url.trim(),
        thumbnailUrl: thumbnailUrl?.trim() || null,
        difficulty: difficulty || 'BEGINNER',
        position: position || 'ALL',
        isControversial: isControversial ?? false,
        isPublished: isPublished ?? false,
        tags: tags ?? [],
        uploadedById: session.user.id,
        laws: {
          create: (lawIds as number[] | undefined)?.map((lawId) => ({ lawId })) ?? [],
        },
      },
      include: { laws: true },
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (err) {
    console.error('Error creating video:', err)
    return NextResponse.json({ error: 'فشل في إنشاء الفيديو' }, { status: 500 })
  }
}
