import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllVideos, createVideo } from '@/lib/video-store'

export const dynamic = 'force-dynamic'

function forbidden() {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

// GET /api/admin/videos — list ALL videos (published + draft)
export async function GET() {
  if (!(await requireAdmin())) return forbidden()
  return NextResponse.json({ videos: getAllVideos() })
}

// POST /api/admin/videos — create video
export async function POST(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return forbidden()

  try {
    const body = await req.json()
    const { titleAr, url } = body

    if (!titleAr?.trim()) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
    }
    if (!url?.trim()) {
      return NextResponse.json({ error: 'رابط الفيديو مطلوب' }, { status: 400 })
    }

    const video = createVideo({
      titleAr: titleAr.trim(),
      titleEn: body.titleEn?.trim() || null,
      descriptionAr: body.descriptionAr?.trim() || null,
      url: url.trim(),
      thumbnailUrl: body.thumbnailUrl?.trim() || null,
      difficulty: body.difficulty || 'BEGINNER',
      position: body.position || 'ALL',
      isControversial: body.isControversial ?? false,
      isPublished: body.isPublished ?? true,
      tags: body.tags ?? [],
      laws: (body.lawIds as number[] | undefined)?.map((lawId) => ({ lawId })) ?? [],
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (err) {
    console.error('Error creating video:', err)
    return NextResponse.json({ error: 'فشل في إنشاء الفيديو' }, { status: 500 })
  }
}
