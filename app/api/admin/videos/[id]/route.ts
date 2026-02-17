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

// GET /api/admin/videos/[id] — get single video for admin
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()

  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: { laws: { select: { lawId: true } } },
  })

  if (!video) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })

  return NextResponse.json({ video })
}

// PUT /api/admin/videos/[id] — full update (edit form)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()

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

    // Delete existing law relations then recreate
    await prisma.videoLaw.deleteMany({ where: { videoId: params.id } })

    const video = await prisma.video.update({
      where: { id: params.id },
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
        laws: {
          create: (lawIds as number[] | undefined)?.map((lawId) => ({ lawId })) ?? [],
        },
      },
      include: { laws: true },
    })

    return NextResponse.json({ video })
  } catch (err) {
    console.error('Error updating video:', err)
    return NextResponse.json({ error: 'فشل في تحديث الفيديو' }, { status: 500 })
  }
}

// PATCH /api/admin/videos/[id] — partial update (e.g. toggle isPublished)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()

  try {
    const body = await req.json()

    // Only allow specific partial fields for security
    const allowed: Record<string, unknown> = {}
    if (typeof body.isPublished === 'boolean') allowed.isPublished = body.isPublished

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'لا توجد حقول صالحة للتحديث' }, { status: 400 })
    }

    const video = await prisma.video.update({
      where: { id: params.id },
      data: allowed,
    })

    return NextResponse.json({ video })
  } catch (err) {
    console.error('Error patching video:', err)
    return NextResponse.json({ error: 'فشل في التحديث' }, { status: 500 })
  }
}

// DELETE /api/admin/videos/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()

  try {
    await prisma.video.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting video:', err)
    return NextResponse.json({ error: 'فشل في حذف الفيديو' }, { status: 500 })
  }
}
