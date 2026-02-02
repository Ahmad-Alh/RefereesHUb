'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Play,
  Filter,
  Search,
  Loader2,
  Video
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoItem {
  id: string
  titleAr: string
  descriptionAr: string | null
  url: string
  thumbnailUrl: string | null
  category?: string
}

// Video categories
const videoCategories = [
  { id: 'OFFSIDE', label: 'حالات التسلل', icon: '🚩' },
  { id: 'HANDBALL', label: 'حالات لمسة اليد', icon: '✋' },
  { id: 'DOGSO', label: 'ايقاف فرصة محققة أو هجوم واعد', icon: '🎯' },
  { id: 'PHYSICAL', label: 'التدخلات الجسدية', icon: '💪' },
  { id: 'ADMINISTRATIVE', label: 'القرارات الادارية', icon: '📋' },
]

export default function VideosPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [category])

  const fetchVideos = async () => {
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)

      const response = await fetch(`/api/videos?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = searchQuery
    ? videos.filter(
        (video) =>
          video.titleAr.includes(searchQuery) ||
          video.descriptionAr?.includes(searchQuery)
      )
    : videos

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">مكتبة الفيديو</h1>
        <p className="text-gray-500 text-sm">شاهد مواقف تحكيمية وتعلم منها</p>
      </header>

      {/* Search & Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="ابحث في الفيديوهات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-3 rounded-xl border transition-colors',
              showFilters
                ? 'bg-green-50 border-green-200 text-green-600'
                : 'bg-white border-gray-200 text-gray-600'
            )}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التصنيف
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full transition-colors',
                    category === ''
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  الكل
                </button>
                {videoCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1',
                      category === cat.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery ? `لا توجد نتائج لـ "${searchQuery}"` : 'لا توجد فيديوهات متاحة'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}

function VideoCard({ video }: { video: VideoItem }) {
  const router = useRouter()

  const getCategoryLabel = (categoryId?: string) => {
    const cat = videoCategories.find(c => c.id === categoryId)
    return cat ? `${cat.icon} ${cat.label}` : null
  }

  return (
    <div
      onClick={() => router.push(`/videos/${video.id}`)}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
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
            <Video className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-green-600 mr-[-2px]" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
          {video.titleAr}
        </h3>
        {video.descriptionAr && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {video.descriptionAr}
          </p>
        )}
        {video.category && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {getCategoryLabel(video.category)}
          </span>
        )}
      </div>
    </div>
  )
}
