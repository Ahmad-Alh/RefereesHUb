import { NextRequest, NextResponse } from 'next/server'
import { getVideoById, updateVideo, deleteVideo } from '@/lib/video-store'
import { addMediaFile } from '@/lib/media-store'

export const dynamic = 'force-dynamic'

// GET /api/admin/videos/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const video = getVideoById(params.id)
  if (!video) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })

  return NextResponse.json({ video })
}

// PUT /api/admin/videos/[id] — full update
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contentType = req.headers.get('content-type') || ''

    let titleAr = ''
    let url = ''
    let titleEn: string | null = null
    let descriptionAr: string | null = null
    let thumbnailUrl: string | null = null
    let difficulty = 'BEGINNER'
    let position = 'ALL'
    let isControversial = false
    let isPublished = false
    let tags: string[] = []
    let lawIds: number[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      titleAr = (formData.get('titleAr') as string | null)?.trim() || ''
      url = (formData.get('url') as string | null)?.trim() || ''
      titleEn = (formData.get('titleEn') as string | null)?.trim() || null
      descriptionAr = (formData.get('descriptionAr') as string | null)?.trim() || null
      thumbnailUrl = (formData.get('thumbnailUrl') as string | null)?.trim() || null
      difficulty = ((formData.get('difficulty') as string | null) || 'BEGINNER').trim()
      position = ((formData.get('position') as string | null) || 'ALL').trim()
      isControversial = (formData.get('isControversial') as string | null) === 'true'
      isPublished = (formData.get('isPublished') as string | null) === 'true'

      const tagsRaw = (formData.get('tags') as string | null) || '[]'
      const lawIdsRaw = (formData.get('lawIds') as string | null) || '[]'
      tags = JSON.parse(tagsRaw)
      lawIds = JSON.parse(lawIdsRaw)

      const file = formData.get('file') as File | null
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const media = addMediaFile({
          fileName: file.name,
          mimeType: file.type || 'video/mp4',
          buffer: Buffer.from(bytes),
        })
        url = `/api/media/${media.id}`
      }
    } else {
      const body = await req.json()
      titleAr = body.titleAr?.trim() || ''
      url = body.url?.trim() || ''
      titleEn = body.titleEn?.trim() || null
      descriptionAr = body.descriptionAr?.trim() || null
      thumbnailUrl = body.thumbnailUrl?.trim() || null
      difficulty = body.difficulty || 'BEGINNER'
      position = body.position || 'ALL'
      isControversial = body.isControversial ?? false
      isPublished = body.isPublished ?? false
      tags = body.tags ?? []
      lawIds = body.lawIds ?? []
    }

    if (!titleAr) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
    }
    if (!url) {
      return NextResponse.json({ error: 'ارفع ملف فيديو أو أضف رابط فيديو' }, { status: 400 })
    }

    const video = updateVideo(params.id, {
      titleAr,
      titleEn,
      descriptionAr,
      url,
      thumbnailUrl,
      difficulty,
      position,
      isControversial,
      isPublished,
      tags: Array.isArray(tags) ? tags : [],
      laws: (Array.isArray(lawIds) ? lawIds : []).map((lawId) => ({ lawId: Number(lawId) })),
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
  const ok = deleteVideo(params.id)
  if (!ok) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })

  return NextResponse.json({ success: true })
}
