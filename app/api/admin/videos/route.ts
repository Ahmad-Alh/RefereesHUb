import { NextRequest, NextResponse } from 'next/server'
import { getAllVideos, createVideo } from '@/lib/video-store'
import { addMediaFile } from '@/lib/media-store'

export const dynamic = 'force-dynamic'

function parseArray(value: string | null): unknown[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function GET() {
  return NextResponse.json({ videos: getAllVideos() })
}

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

      tags = parseArray(formData.get('tags') as string | null) as string[]
      lawIds = parseArray(formData.get('lawIds') as string | null).map(Number)

      const file = formData.get('file') as File | null
      if (file && file.size > 0) {
        const media = addMediaFile({
          fileName: file.name,
          mimeType: file.type || 'video/mp4',
          buffer: Buffer.from(await file.arrayBuffer()),
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
      tags = Array.isArray(body.tags) ? body.tags : []
      lawIds = Array.isArray(body.lawIds) ? body.lawIds.map(Number) : []
    }

    if (!titleAr) return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
    if (!url) return NextResponse.json({ error: 'ارفع ملف فيديو أو أضف رابط فيديو' }, { status: 400 })

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
