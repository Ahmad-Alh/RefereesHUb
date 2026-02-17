import { NextRequest, NextResponse } from 'next/server'
import { getDocuments, addDocument } from '@/lib/document-store'
import { addMediaFile } from '@/lib/media-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(getDocuments())
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const titleAr = (formData.get('titleAr') as string | null)?.trim()

    if (!file || !titleAr) {
      return NextResponse.json({ error: 'العنوان والملف مطلوبان' }, { status: 400 })
    }

    const lowerName = file.name.toLowerCase()
    const type = file.type || 'application/pdf'
    if (!lowerName.endsWith('.pdf') && type !== 'application/pdf') {
      return NextResponse.json({ error: 'يُسمح بملفات PDF فقط' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const media = addMediaFile({
      fileName: file.name,
      mimeType: type,
      buffer,
    })

    const doc = {
      id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      titleAr,
      fileName: file.name,
      fileUrl: `/api/media/${media.id}`,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      mediaId: media.id,
    }

    addDocument(doc)
    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    console.error('Error uploading document:', err)
    return NextResponse.json({ error: 'فشل في رفع الملف' }, { status: 500 })
  }
}
