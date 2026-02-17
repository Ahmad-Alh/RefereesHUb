import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDocuments, addDocument } from '@/lib/document-store'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'documents')

function forbidden() {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

// GET /api/admin/documents — list all documents
export async function GET() {
  if (!(await requireAdmin())) return forbidden()
  return NextResponse.json(getDocuments())
}

// POST /api/admin/documents — upload PDF
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return forbidden()

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const titleAr = (formData.get('titleAr') as string | null)?.trim()

    if (!file || !titleAr) {
      return NextResponse.json({ error: 'العنوان والملف مطلوبان' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'يُسمح بملفات PDF فقط' }, { status: 400 })
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    }

    const id = Date.now().toString()
    const safeName = file.name.replace(/[^a-zA-Z0-9.\u0600-\u06FF_-]/g, '_')
    const fileName = `${id}-${safeName}`
    const filePath = path.join(UPLOADS_DIR, fileName)

    const bytes = await file.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(bytes))

    const doc = {
      id,
      titleAr,
      fileName: file.name,
      fileUrl: `/uploads/documents/${fileName}`,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    }

    addDocument(doc)
    return NextResponse.json(doc, { status: 201 })
  } catch (err) {
    console.error('Error uploading document:', err)
    return NextResponse.json({ error: 'فشل في رفع الملف' }, { status: 500 })
  }
}
