import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getVideoById, updateVideo, deleteVideo } from '@/lib/video-store'

export const dynamic = 'force-dynamic'

function forbidden() {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

// GET /api/admin/videos/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()

  const video = getVideoById(params.id)
  if (!video) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })

  return NextResponse.json({ video })
}

// PUT /api/admin/videos/[id] — full update
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()

  try {
    const body = await req.json()

    if (!body.titleAr?.trim()) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
    }
    if (!body.url?.trim()) {
      return NextResponse.json({ error: 'رابط الفيديو مطلوب' }, { status: 400 })
    }

    const video = updateVideo(params.id, {
      titleAr: body.titleAr.trim(),
      titleEn: body.titleEn?.trim() || null,
      descriptionAr: body.descriptionAr?.trim() || null,
      url: body.url.trim(),
      thumbnailUrl: body.thumbnailUrl?.trim() || null,
      difficulty: body.difficulty || 'BEGINNER',
      position: body.position || 'ALL',
      isControversial: body.isControversial ?? false,
      isPublished: body.isPublished ?? false,
      tags: body.tags ?? [],
      laws: (body.lawIds as number[] | undefined)?.map((lawId) => ({ lawId })) ?? [],
    })

    if (!video) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })

    return NextResponse.json({ video })
  } catch (err) {
    console.error('Error updating video:', err)
    return NextResponse.json({ error: 'فشل في التحديث' }, { status: 500 })
  }
}

// PATCH /api/admin/videos/[id] — partial update (e.g. toggle isPublished)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()

  try {
    const body = await req.json()
    const allowed: Record<string, unknown> = {}
    if (typeof body.isPublished === 'boolean') allowed.isPublished = body.isPublished

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'لا توجد حقول صالحة' }, { status: 400 })
    }

    const video = updateVideo(params.id, allowed)
    if (!video) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })

    return NextResponse.json({ video })
  } catch (err) {
    console.error('Error patching video:', err)
    return NextResponse.json({ error: 'فشل في التحديث' }, { status: 500 })
  }
}

// DELETE /api/admin/videos/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return forbidden()

  const ok = deleteVideo(params.id)
  if (!ok) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })

  return NextResponse.json({ success: true })
}
