import { NextRequest, NextResponse } from 'next/server'
import { deleteDocument } from '@/lib/document-store'
import { deleteMediaFile } from '@/lib/media-store'

export const dynamic = 'force-dynamic'

// DELETE /api/admin/documents/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const deleted = deleteDocument(params.id)
  if (!deleted) {
    return NextResponse.json({ error: 'المستند غير موجود' }, { status: 404 })
  }

  if (deleted.mediaId) {
    deleteMediaFile(deleted.mediaId)
  } else {
    const mediaMatch = deleted.fileUrl.match(/^\/api\/media\/(.+)$/)
    if (mediaMatch?.[1]) {
      deleteMediaFile(mediaMatch[1])
    }
  }

  return NextResponse.json({ success: true })
}
