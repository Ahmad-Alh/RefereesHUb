'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video,
  Plus,
  ChevronRight,
  Loader2,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Play,
  ExternalLink
} from 'lucide-react'
import { formatDateAr, toArabicNumerals } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface VideoItem {
  id: string
  titleAr: string
  titleEn: string | null
  descriptionAr: string | null
  url: string
  thumbnailUrl: string | null
  duration: number | null
  difficulty: string
  position: string
  isControversial: boolean
  isPublished: boolean
  createdAt: string
  laws: { lawId: number }[]
}

const difficultyLabels: Record<string, string> = {
  BEGINNER: 'مبتدئ',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'متقدم',
}

const difficultyColors: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-amber-100 text-amber-700',
  ADVANCED: 'bg-red-100 text-red-700',
}

const positionLabels: Record<string, string> = {
  CENTER_REF: 'حكم وسط',
  ASSISTANT_REF: 'حكم مساعد',
  FOURTH_OFFICIAL: 'الحكم الرابع',
  ALL: 'الجميع',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function AdminVideosPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const url = filter === 'all'
        ? '/api/videos'
        : `/api/videos?difficulty=${filter}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch videos')
      }

      const data = await response.json()
      setVideos(data.videos)
    } catch {
      setError('فشل في جلب الفيديوهات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [filter])

  const handleDelete = async (videoId: string, videoTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${videoTitle}"؟`)) {
      return
    }

    try {
      setActionLoading(videoId)
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete')
      }

      await fetchVideos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setActionLoading(null)
    }
  }

  const handleTogglePublish = async (videoId: string, currentStatus: boolean) => {
    try {
      setActionLoading(videoId)
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update')
      }

      await fetchVideos()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredVideos = videos.filter((video) =>
    video.titleAr.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-900">إدارة الفيديوهات</h1>
            <p className="text-gray-500 mt-1">رفع وإدارة فيديوهات التحكيم</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchVideos}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إضافة فيديو
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
            placeholder="البحث في الفيديوهات..."
            className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">جميع المستويات</option>
          {Object.entries(difficultyLabels).map(([key, label]) => (
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

      {/* Videos Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد فيديوهات</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            إضافة أول فيديو
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className={cn(
                "bg-white rounded-xl border overflow-hidden transition-colors",
                video.isPublished ? "border-gray-100 hover:border-gray-200" : "border-red-100 bg-red-50/30"
              )}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.titleAr}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                {video.duration && (
                  <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {formatDuration(video.duration)}
                  </span>
                )}
                {!video.isPublished && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                    مخفي
                  </span>
                )}
                {video.isControversial && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs rounded">
                    مثير للجدل
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{video.titleAr}</h3>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs flex-shrink-0", difficultyColors[video.difficulty])}>
                    {difficultyLabels[video.difficulty]}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{positionLabels[video.position]}</span>
                  {video.laws.length > 0 && (
                    <>
                      <span>•</span>
                      <span>قوانين: {video.laws.map(l => toArabicNumerals(l.lawId)).join('، ')}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {formatDateAr(new Date(video.createdAt))}
                  </span>
                  <div className="flex items-center gap-1">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="مشاهدة"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleTogglePublish(video.id, video.isPublished)}
                      disabled={actionLoading === video.id}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        video.isPublished
                          ? "text-amber-500 hover:bg-amber-50"
                          : "text-green-500 hover:bg-green-50"
                      )}
                      title={video.isPublished ? 'إخفاء' : 'نشر'}
                    >
                      {actionLoading === video.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : video.isPublished ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(video.id, video.titleAr)}
                      disabled={actionLoading === video.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      {actionLoading === video.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      {showAddModal && (
        <AddVideoModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchVideos()
          }}
        />
      )}
    </div>
  )
}

function AddVideoModal({
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
    url: '',
    thumbnailUrl: '',
    duration: '',
    difficulty: 'BEGINNER',
    position: 'ALL',
    isControversial: false,
    lawIds: [] as number[],
    isPublished: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create video')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const toggleLaw = (lawId: number) => {
    setFormData((prev) => ({
      ...prev,
      lawIds: prev.lawIds.includes(lawId)
        ? prev.lawIds.filter((id) => id !== lawId)
        : [...prev.lawIds, lawId],
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">إضافة فيديو جديد</h2>
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
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رابط الفيديو *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://youtube.com/..."
              required
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">
              أدخل رابط YouTube أو Vimeo أو رابط مباشر للفيديو
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رابط الصورة المصغرة
            </label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://..."
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المدة (بالثواني)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="120"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مستوى الصعوبة
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(difficultyLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              موقف الحكم
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(positionLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ربط بالقوانين
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 17 }, (_, i) => i + 1).map((lawId) => (
                <button
                  key={lawId}
                  type="button"
                  onClick={() => toggleLaw(lawId)}
                  className={cn(
                    'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                    formData.lawIds.includes(lawId)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {toArabicNumerals(lawId)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
            <div>
              <span className="font-medium text-amber-700">قرار مثير للجدل</span>
              <p className="text-sm text-amber-600">تمييز الفيديو كقرار مثير للجدل</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isControversial: !formData.isControversial })}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                formData.isControversial ? 'bg-amber-500' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
                  formData.isControversial ? 'right-1' : 'right-7'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-700">نشر الفيديو</span>
              <p className="text-sm text-gray-500">إظهار الفيديو للمستخدمين</p>
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
              className="flex-1 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ الفيديو'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
