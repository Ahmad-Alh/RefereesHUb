'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Plus,
  ChevronRight,
  Loader2,
  AlertCircle,
  Trash2,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Upload
} from 'lucide-react'
import { formatDateAr, toArabicNumerals } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Document {
  id: string
  titleAr: string
  titleEn: string | null
  descriptionAr: string | null
  fileUrl: string
  fileName: string
  fileSize: number
  fileType: string
  category: string
  isPublished: boolean
  downloadCount: number
  createdAt: string
  uploadedBy: {
    name: string
    refereeNumber: string
  }
}

const categoryLabels: Record<string, string> = {
  IFAB_LAWS: 'قوانين اللعبة',
  TRAINING_MATERIALS: 'مواد تدريبية',
  CIRCULARS: 'تعميمات',
  FORMS: 'نماذج',
  OTHER: 'أخرى',
}

const categoryColors: Record<string, string> = {
  IFAB_LAWS: 'bg-green-100 text-green-700',
  TRAINING_MATERIALS: 'bg-blue-100 text-blue-700',
  CIRCULARS: 'bg-amber-100 text-amber-700',
  FORMS: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-700',
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function AdminDocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const url = filter === 'all'
        ? '/api/admin/documents'
        : `/api/admin/documents?category=${filter}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.documents)
    } catch {
      setError('فشل في جلب المستندات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [filter])

  const handleDelete = async (docId: string, docTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${docTitle}"؟`)) {
      return
    }

    try {
      setActionLoading(docId)
      const response = await fetch(`/api/admin/documents/${docId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete')
      }

      await fetchDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setActionLoading(null)
    }
  }

  const handleTogglePublish = async (docId: string, currentStatus: boolean) => {
    try {
      setActionLoading(docId)
      const response = await fetch(`/api/admin/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }

      await fetchDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronRight className="w-5 h-5" />
          <span>العودة</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المستندات</h1>
            <p className="text-gray-500 mt-1">رفع وإدارة الملفات والمستندات</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDocuments}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إضافة مستند
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في المستندات..."
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">جميع الفئات</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="mr-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد مستندات</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            إضافة أول مستند
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                "bg-white rounded-xl p-4 border transition-colors",
                doc.isPublished ? "border-gray-100 hover:border-gray-200" : "border-red-100 bg-red-50/30"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900">{doc.titleAr}</h3>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs", categoryColors[doc.category])}>
                        {categoryLabels[doc.category]}
                      </span>
                      {!doc.isPublished && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                          مخفي
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{toArabicNumerals(doc.downloadCount)} تحميل</span>
                      <span>•</span>
                      <span>رفع بواسطة {doc.uploadedBy.name}</span>
                      <span>•</span>
                      <span>{formatDateAr(new Date(doc.createdAt))}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="تحميل"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleTogglePublish(doc.id, doc.isPublished)}
                    disabled={actionLoading === doc.id}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      doc.isPublished
                        ? "text-amber-500 hover:bg-amber-50"
                        : "text-green-500 hover:bg-green-50"
                    )}
                    title={doc.isPublished ? 'إخفاء' : 'نشر'}
                  >
                    {actionLoading === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : doc.isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.titleAr)}
                    disabled={actionLoading === doc.id}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    {actionLoading === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <AddDocumentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchDocuments()
          }}
        />
      )}
    </div>
  )
}

function AddDocumentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    fileType: '',
    category: 'OTHER' as string,
    isPublished: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create document')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">إضافة مستند جديد</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              العنوان (عربي) *
            </label>
            <input
              type="text"
              value={formData.titleAr}
              onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              العنوان (إنجليزي)
            </label>
            <input
              type="text"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوصف
            </label>
            <textarea
              value={formData.descriptionAr}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رابط الملف *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="https://drive.google.com/..."
                required
                dir="ltr"
              />
              <div className="p-3 bg-gray-100 rounded-lg">
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              أدخل رابط الملف من Google Drive أو Dropbox أو أي خدمة تخزين سحابي
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم الملف *
              </label>
              <input
                type="text"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="document.pdf"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                حجم الملف (KB) *
              </label>
              <input
                type="number"
                value={formData.fileSize || ''}
                onChange={(e) => setFormData({ ...formData, fileSize: parseInt(e.target.value) * 1024 || 0 })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="1024"
                required
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع الملف *
              </label>
              <select
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">اختر نوع الملف</option>
                <option value="application/pdf">PDF</option>
                <option value="application/msword">Word (DOC)</option>
                <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word (DOCX)</option>
                <option value="application/vnd.ms-excel">Excel (XLS)</option>
                <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel (XLSX)</option>
                <option value="application/vnd.ms-powerpoint">PowerPoint (PPT)</option>
                <option value="image/jpeg">صورة (JPEG)</option>
                <option value="image/png">صورة (PNG)</option>
                <option value="application/zip">ملف مضغوط (ZIP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الفئة *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-700">نشر المستند</span>
              <p className="text-sm text-gray-500">إظهار المستند للمستخدمين</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                formData.isPublished ? 'bg-green-500' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
                  formData.isPublished ? 'right-1' : 'right-7'
                )}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ المستند'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
