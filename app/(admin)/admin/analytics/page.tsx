import { prisma } from '@/lib/prisma'
import { BarChart2, Video, FileQuestion } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const [totalVideos, published, drafts, questions] = await Promise.all([
    prisma.video.count(),
    prisma.video.count({ where: { isPublished: true } }),
    prisma.video.count({ where: { isPublished: false } }),
    prisma.question.count(),
  ])

  const publishRate = totalVideos > 0 ? Math.round((published / totalVideos) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">التحليلات</h1>
        <p className="text-gray-500 text-sm mt-0.5">إحصائيات المحتوى</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBlock icon={Video} label="إجمالي الفيديوهات" value={totalVideos} />
        <StatBlock icon={Video} label="منشور" value={published} sub={`${publishRate}%`} />
        <StatBlock icon={Video} label="مسودة" value={drafts} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-green-500" />
          معدل النشر
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">الفيديوهات المنشورة</span>
            <span className="text-white">{publishRate}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${publishRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-green-500" />
          الأسئلة
        </h2>
        <p className="text-3xl font-bold text-white">{questions}</p>
        <p className="text-xs text-gray-500 mt-1">سؤال في البنك</p>
      </div>
    </div>
  )
}

function StatBlock({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: number
  sub?: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <Icon className="w-5 h-5 text-green-500 mb-3" />
      <p className="text-2xl font-bold text-white">
        {value}
        {sub && <span className="text-sm text-gray-500 ml-1">{sub}</span>}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
