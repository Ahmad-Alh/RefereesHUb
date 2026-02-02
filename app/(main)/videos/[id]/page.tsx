'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Loader2, BookOpen, AlertTriangle } from 'lucide-react'
import ReactPlayer from 'react-player'
import { toArabicNumerals } from '@/lib/utils'

interface VideoDetail {
  id: string
  titleAr: string
  titleEn: string | null
  descriptionAr: string | null
  descriptionEn: string | null
  url: string
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

interface PageProps {
  params: Promise<{ id: string }>
}

export default function VideoDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideo()
  }, [id])

  const fetchVideo = async () => {
    try {
      const response = await fetch(`/api/videos/${id}`)
      if (response.ok) {
        const data = await response.json()
        setVideo(data.video)
      } else {
        router.push('/videos')
      }
    } catch (error) {
      console.error('Failed to fetch video:', error)
      router.push('/videos')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  if (!video) {
    return null
  }

  return (
    <div className="pb-6">
      {/* Back Button */}
      <div className="px-4 py-3">
        <button
          onClick={() => router.push('/videos')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ChevronRight className="w-5 h-5" />
          <span>العودة للمكتبة</span>
        </button>
      </div>

      {/* Video Player */}
      <div className="aspect-video bg-black">
        <ReactPlayer
          url={video.url}
          width="100%"
          height="100%"
          controls
          playing={false}
          config={{
            youtube: {
              playerVars: { showinfo: 1 },
            },
          }}
        />
      </div>

      {/* Video Info */}
      <div className="px-4 py-6">
        {/* Title & Tags */}
        <div className="mb-4">
          {video.isControversial && (
            <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mb-2">
              <AlertTriangle className="w-3 h-3" />
              قرار مثير للجدل
            </span>
          )}
          <h1 className="text-xl font-bold text-gray-900 mb-2">{video.titleAr}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {difficultyLabels[video.difficulty]}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {positionLabels[video.position]}
            </span>
          </div>
        </div>

        {/* Description */}
        {video.descriptionAr && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-2">الوصف</h2>
            <p className="text-gray-600 leading-relaxed arabic-text">
              {video.descriptionAr}
            </p>
          </div>
        )}

        {/* Related Laws */}
        {video.laws.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-2">القوانين ذات الصلة</h2>
            <div className="space-y-2">
              {video.laws.map((law) => (
                <button
                  key={law.lawId}
                  onClick={() => router.push(`/law/${law.lawId}`)}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-green-200 transition-all"
                >
                  <span className="flex items-center gap-2 text-gray-900">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    القانون {toArabicNumerals(law.lawId)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-180" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
