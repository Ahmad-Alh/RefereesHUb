'use client'

import { useEffect, useState, useRef } from 'react'
import { FileText, Upload, Trash2, Loader2, Plus, X } from 'lucide-react'

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

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [titleAr, setTitleAr] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchDocuments = () => {
    setLoading(true)
    fetch('/api/admin/documents')
      .then((r) => r.json())
      .then((data) => setDocuments(Array.isArray(data) ? data : []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !titleAr.trim()) {
      setError('يرجى إدخال العنوان واختيار ملف PDF')
      return
    }
    setError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('titleAr', titleAr.trim())
      const res = await fetch('/api/admin/documents', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'حدث خطأ أثناء الرفع')
        return
      }
      setTitleAr('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      setShowForm(false)
      fetchDocuments()
    } catch {
      setError('حدث خطأ أثناء الرفع')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المستند؟')) return
    await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' })
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">المستندات</h1>
          <p className="text-gray-600 text-sm mt-0.5">{documents.length} مستند</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setError('')
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'إلغاء' : 'رفع مستند'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-green-700" />
            رفع ملف PDF
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">العنوان</label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="w-full bg-gray-100 text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors placeholder:text-gray-600"
                placeholder="اسم المستند"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">ملف PDF</label>
              <label className="block rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-400 transition-colors cursor-pointer p-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="sr-only"
                  required
                />
                <div className="text-sm text-gray-700 text-center">
                  {file ? (
                    <>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{formatFileSize(file.size)}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">اضغط لاختيار ملف PDF</p>
                      <p className="text-xs text-gray-600 mt-1">أو اسحب الملف هنا</p>
                    </>
                  )}
                </div>
              </label>
            </div>
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  رفع
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-500" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد مستندات مرفوعة</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-red-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate">{doc.titleAr}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {doc.fileName} · {formatFileSize(doc.fileSize)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-700 hover:text-green-800 transition-colors px-2 py-1 rounded hover:bg-green-50"
                >
                  عرض
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
