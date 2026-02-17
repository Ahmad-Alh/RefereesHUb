import { NextRequest, NextResponse } from 'next/server'
import { getAllVideos, createVideo } from '@/lib/video-store'
import { addMediaFile } from '@/lib/media-store'

export const dynamic = 'force-dynamic'

// GET /api/admin/videos — list ALL videos (published + draft)
export async function GET() {
  return NextResponse.json({ videos: getAllVideos() })
}

// POST /api/admin/videos — create video
export async function POST(req: NextRequest) {
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
    let isPublished = true
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
      isPublished = (formData.get('isPublished') as string | null) !== 'false'

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
      isPublished = body.isPublished ?? true
      tags = body.tags ?? []
      lawIds = body.lawIds ?? []
    }

    if (!titleAr) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
    }
    if (!url) {
      return NextResponse.json({ error: 'ارفع ملف فيديو أو أضف رابط فيديو' }, { status: 400 })
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
      tags: Array.isArray(tags) ? tags : [],
      laws: (Array.isArray(lawIds) ? lawIds : []).map((lawId) => ({ lawId: Number(lawId) })),
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (err) {
    console.error('Error creating video:', err)
    return NextResponse.json({ error: 'فشل في إنشاء الفيديو' }, { status: 500 })
  }
}
