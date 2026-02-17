import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteDocument } from '@/lib/document-store'
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

// DELETE /api/admin/documents/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) return forbidden()

  const deleted = deleteDocument(params.id)
  if (!deleted) {
    return NextResponse.json({ error: 'المستند غير موجود' }, { status: 404 })
  }

  // Delete physical file
  try {
    const fileName = path.basename(deleted.fileUrl)
    const filePath = path.join(UPLOADS_DIR, fileName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (err) {
    console.error('Error deleting file:', err)
  }

  return NextResponse.json({ success: true })
}
