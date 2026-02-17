'use client'

import { useEffect, useState } from 'react'
import { FolderOpen, FileText, Download, Loader2 } from 'lucide-react'

interface Document {
  id: string
  titleAr: string
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/documents')
      .then((r) => r.json())
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">المستندات</h1>
        <p className="text-gray-500 text-sm">الملفات والوثائق الرسمية</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FolderOpen className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">لا توجد مستندات حتى الآن</p>
          <p className="text-sm mt-1 opacity-70">ستظهر الملفات هنا بعد رفعها</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <a
              key={doc.id}
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{doc.titleAr}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(doc.fileSize)}</p>
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Download className="w-4 h-4 text-green-600" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
