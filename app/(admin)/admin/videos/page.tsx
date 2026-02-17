'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Video,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react'

interface VideoItem {
  id: string
  titleAr: string
  isPublished: boolean
  difficulty: string
  tags: string[]
  laws: { lawId: number }[]
  createdAt: string
}

const difficultyLabel: Record<string, string> = {
  BEGINNER: 'مبتدئ',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'متقدم',
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/videos')
      if (res.ok) {
        const data = await res.json()
        setVideos(data.videos || [])
      }
    } catch (err) {
      console.error('Failed to fetch videos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const togglePublish = async (video: VideoItem) => {
    setTogglingId(video.id)
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !video.isPublished }),
      })
      if (res.ok) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === video.id ? { ...v, isPublished: !v.isPublished } : v
          )
        )
      }
    } catch (err) {
      console.error('Failed to toggle publish:', err)
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete video:', err)
    }
  }

  const filtered = search
    ? videos.filter((v) => v.titleAr.includes(search))
    : videos

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">الفيديوهات</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {videos.length} فيديو · {videos.filter((v) => v.isPublished).length} منشور
          </p>
        </div>
        <Link
          href="/admin/videos/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          فيديو جديد
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="search"
          placeholder="بحث في الفيديوهات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 text-white pr-10 pl-4 py-2.5 rounded-lg text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <Video className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {search ? `لا توجد نتائج لـ "${search}"` : 'لا توجد فيديوهات بعد'}
          </p>
          {!search && (
            <Link
              href="/admin/videos/new"
              className="inline-block mt-4 text-green-500 text-sm hover:underline"
            >
              أضف أول فيديو
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    العنوان
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                    الحالة
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24 hidden md:table-cell">
                    الصعوبة
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24 hidden md:table-cell">
                    القوانين
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium line-clamp-1">{video.titleAr}</p>
                      {video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {video.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                          video.isPublished
                            ? 'bg-green-950 text-green-400'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {video.isPublished ? 'منشور' : 'مسودة'}
                      </span>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400">
                        {difficultyLabel[video.difficulty] || video.difficulty}
                      </span>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400">
                        {video.laws.map((l) => l.lawId).join(', ') || '—'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Publish toggle */}
                        <button
                          onClick={() => togglePublish(video)}
                          disabled={togglingId === video.id}
                          title={video.isPublished ? 'إلغاء النشر' : 'نشر'}
                          className={`p-1.5 rounded transition-colors ${
                            video.isPublished
                              ? 'text-green-500 hover:bg-green-950'
                              : 'text-gray-500 hover:bg-gray-800'
                          }`}
                        >
                          {togglingId === video.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : video.isPublished ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>

                        {/* Edit */}
                        <Link
                          href={`/admin/videos/${video.id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
