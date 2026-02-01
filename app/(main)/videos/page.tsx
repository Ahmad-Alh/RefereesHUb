'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Play,
  Filter,
  Search,
  Loader2,
  Video,
  AlertTriangle,
  BookOpen
} from 'lucide-react'
import { toArabicNumerals } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface VideoItem {
  id: string
  titleAr: string
  descriptionAr: string | null
  url: string
  thumbnailUrl: string | null
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  position: 'CENTER_REF' | 'ASSISTANT_REF' | 'FOURTH_OFFICIAL' | 'ALL'
  isControversial: boolean
  laws: { lawId: number }[]
}

const difficultyLabels = {
  BEGINNER: 'مبتدئ',
  INTERMEDIATE: 'متوسط',
  ADVANCED: 'متقدم',
}

const positionLabels = {
  CENTER_REF: 'حكم الوسط',
  ASSISTANT_REF: 'الحكم المساعد',
  FOURTH_OFFICIAL: 'الحكم الرابع',
  ALL: 'الجميع',
}

export default function VideosPage() {
  const { status } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    difficulty: '',
    position: '',
    lawId: '',
    controversial: false,
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/videos')
      return
    }

    if (status === 'authenticated') {
      fetchVideos()
    }
  }, [status, router, filters])

  const fetchVideos = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.difficulty) params.append('difficulty', filters.difficulty)
      if (filters.position) params.append('position', filters.position)
      if (filters.lawId) params.append('lawId', filters.lawId)
      if (filters.controversial) params.append('controversial', 'true')

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

  if (status === 'loading' || loading) {
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
          <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المستوى
              </label>
              <div className="flex gap-2">
                {(['', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, difficulty: level }))
                      }
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-full transition-colors',
                        filters.difficulty === level
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {level === '' ? 'الكل' : difficultyLabels[level]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المنصب
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  ['', 'CENTER_REF', 'ASSISTANT_REF', 'FOURTH_OFFICIAL'] as const
                ).map((pos) => (
                  <button
                    key={pos}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, position: pos }))
                    }
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full transition-colors',
                      filters.position === pos
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {pos === '' ? 'الكل' : positionLabels[pos]}
                  </button>
                ))}
              </div>
            </div>

            {/* Law Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القانون
              </label>
              <select
                value={filters.lawId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, lawId: e.target.value }))
                }
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">جميع القوانين</option>
                {Array.from({ length: 17 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    القانون {toArabicNumerals(i + 1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Controversial Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">قرارات مثيرة للجدل فقط</span>
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    controversial: !prev.controversial,
                  }))
                }
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  filters.controversial ? 'bg-green-500' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
                    filters.controversial ? 'right-1' : 'right-7'
                  )}
                />
              </button>
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
        {video.isControversial && (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            مثير للجدل
          </span>
        )}
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {difficultyLabels[video.difficulty]}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {positionLabels[video.position]}
          </span>
          {video.laws.map((law) => (
            <span
              key={law.lawId}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              القانون {toArabicNumerals(law.lawId)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
