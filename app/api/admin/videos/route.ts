import { NextRequest, NextResponse } from 'next/server'
import { getAllVideos, createVideo } from '@/lib/video-store'
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

// GET /api/admin/videos — list ALL videos (published + draft)
export async function GET() {
  return NextResponse.json({ videos: getAllVideos() })
}

// POST /api/admin/videos — create video
export async function POST(req: NextRequest) {
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
    const isPublishedRaw = formData.get('isPublished') as string | null
    const isPublished = isPublishedRaw ? isPublishedRaw === 'true' : true

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

    const video = createVideo({
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

    return NextResponse.json({ video }, { status: 201 })
  } catch (err) {
    console.error('Error creating video:', err)
    return NextResponse.json({ error: 'فشل في إنشاء الفيديو' }, { status: 500 })
  }
}
