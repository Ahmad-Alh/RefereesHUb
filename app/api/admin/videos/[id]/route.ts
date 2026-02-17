import { NextRequest, NextResponse } from 'next/server'
import { getVideoById, updateVideo, deleteVideo } from '@/lib/video-store'
import { addMediaFile } from '@/lib/media-store'

export const dynamic = 'force-dynamic'

function toStringArray(input: FormDataEntryValue | null): string[] {
  if (typeof input !== 'string' || !input.trim()) return []

  try {
    const parsed = JSON.parse(input)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
    }
  } catch {
    return input.split(',').map((v) => v.trim()).filter(Boolean)
  }

  return []
}

function toNumberArray(input: FormDataEntryValue | null): number[] {
  if (typeof input !== 'string' || !input.trim()) return []

  try {
    const parsed = JSON.parse(input)
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => Number(item))
        .filter((num) => Number.isInteger(num) && num > 0)
    }
  } catch {
    return input
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((num) => Number.isInteger(num) && num > 0)
  }

  return []
}

// GET /api/admin/videos/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const video = getVideoById(params.id)
  if (!video) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })

  return NextResponse.json({ video })
}

// PUT /api/admin/videos/[id] — full update
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData()

    const titleAr = (formData.get('titleAr') as string | null)?.trim() || ''
    const titleEn = (formData.get('titleEn') as string | null)?.trim() || null
    const descriptionAr = (formData.get('descriptionAr') as string | null)?.trim() || null
    const inputUrl = (formData.get('url') as string | null)?.trim() || ''
    const thumbnailUrl = (formData.get('thumbnailUrl') as string | null)?.trim() || null
    const difficulty = (formData.get('difficulty') as string | null) || 'BEGINNER'
    const position = (formData.get('position') as string | null) || 'ALL'
    const isControversial = (formData.get('isControversial') as string | null) === 'true'
    const isPublished = (formData.get('isPublished') as string | null) === 'true'

    const tags = toStringArray(formData.get('tags'))
    const lawIds = toNumberArray(formData.get('lawIds'))

    const upload = formData.get('file')
    const uploadedFile = upload instanceof File && upload.size > 0 ? upload : null

    if (!titleAr) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
    }

    let url = inputUrl
    if (uploadedFile) {
      const media = await addMediaFile(uploadedFile)
      url = `/api/media/${media.id}`
    }

    if (!url) {
      return NextResponse.json({ error: 'مصدر الفيديو مطلوب (ملف أو رابط)' }, { status: 400 })
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
      tags,
      laws: lawIds.map((lawId) => ({ lawId })),
    })

    if (!video) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })

    return NextResponse.json({ video })
  } catch (err) {
    console.error('Error updating video:', err)
    return NextResponse.json({ error: 'فشل في التحديث' }, { status: 500 })
  }
}

// PATCH /api/admin/videos/[id] — partial update (publish toggle only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()

    if (typeof body?.isPublished !== 'boolean') {
      return NextResponse.json({ error: 'لا توجد حقول صالحة' }, { status: 400 })
    }

    const video = updateVideo(params.id, { isPublished: body.isPublished })
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
