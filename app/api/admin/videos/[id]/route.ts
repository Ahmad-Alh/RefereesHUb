import { NextRequest, NextResponse } from 'next/server'
import { getVideoById, updateVideo, deleteVideo } from '@/lib/video-store'
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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const video = getVideoById(params.id)
  if (!video) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })
  return NextResponse.json({ video })
}

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
      isPublished = body.isPublished ?? false
      tags = Array.isArray(body.tags) ? body.tags : []
      lawIds = Array.isArray(body.lawIds) ? body.lawIds.map(Number) : []
    }

    if (!titleAr) return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
    if (!url) return NextResponse.json({ error: 'ارفع ملف فيديو أو أضف رابط فيديو' }, { status: 400 })

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

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ok = deleteVideo(params.id)
  if (!ok) return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 })
  return NextResponse.json({ success: true })
}
