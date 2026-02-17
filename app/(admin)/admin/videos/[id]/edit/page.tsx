import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import VideoForm from '../../VideoForm'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export default async function EditVideoPage({ params }: Props) {
  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: { laws: { select: { lawId: true } } },
  })

  if (!video) notFound()

  const initial = {
    titleAr: video.titleAr,
    titleEn: video.titleEn ?? '',
    descriptionAr: video.descriptionAr ?? '',
    url: video.url,
    thumbnailUrl: video.thumbnailUrl ?? '',
    lawIds: video.laws.map((l) => l.lawId),
    difficulty: video.difficulty,
    position: video.position,
    isControversial: video.isControversial,
    isPublished: video.isPublished,
    tags: video.tags ?? [],
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/videos" className="hover:text-gray-300 transition-colors">
          الفيديوهات
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300 line-clamp-1">{video.titleAr}</span>
      </div>

      <h1 className="text-xl font-bold text-white">تعديل الفيديو</h1>

      <VideoForm initial={initial} videoId={video.id} />
    </div>
  )
}
