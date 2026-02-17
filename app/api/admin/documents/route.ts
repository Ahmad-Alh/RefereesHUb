import { NextRequest, NextResponse } from 'next/server'
import { getDocuments, addDocument } from '@/lib/document-store'
import { addMediaFile } from '@/lib/media-store'

export const dynamic = 'force-dynamic'

// GET /api/admin/documents — list all documents
export async function GET() {
  return NextResponse.json(getDocuments())
}

// POST /api/admin/documents — upload PDF
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const titleAr = (formData.get('titleAr') as string | null)?.trim()

    if (!file || !titleAr) {
      return NextResponse.json({ error: 'العنوان والملف مطلوبان' }, { status: 400 })
    }

    const mimeType = file.type || ''
    const isPdfByMime = mimeType === 'application/pdf'
    const isPdfByExt = file.name.toLowerCase().endsWith('.pdf')

    if (!isPdfByMime && !isPdfByExt) {
      return NextResponse.json({ error: 'يُسمح بملفات PDF فقط' }, { status: 400 })
    }

    const media = await addMediaFile(file)
    const id = Date.now().toString()

    const doc = {
      id,
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
