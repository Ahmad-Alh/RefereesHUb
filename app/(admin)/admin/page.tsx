import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Video, FileQuestion, BarChart2, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [videoCount, publishedVideoCount, questionCount, draftVideoCount] =
    await Promise.all([
      prisma.video.count(),
      prisma.video.count({ where: { isPublished: true } }),
      prisma.question.count(),
      prisma.video.count({ where: { isPublished: false } }),
    ])

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-white">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-0.5">نظرة عامة على المحتوى</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="فيديوهات منشورة" value={publishedVideoCount} icon={Video} color="green" />
        <StatCard label="مسودات" value={draftVideoCount} icon={Video} color="yellow" />
        <StatCard label="إجمالي الفيديوهات" value={videoCount} icon={Video} color="blue" />
        <StatCard label="الأسئلة" value={questionCount} icon={FileQuestion} color="purple" />
      </div>

      {/* Quick actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/videos/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة فيديو
          </Link>
          <Link
            href="/admin/questions/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة سؤال
          </Link>
        </div>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <NavCard
          href="/admin/videos"
          icon={Video}
          title="إدارة الفيديوهات"
          description={`${publishedVideoCount} منشور · ${draftVideoCount} مسودة`}
        />
        <NavCard
          href="/admin/questions"
          icon={FileQuestion}
          title="إدارة الأسئلة"
          description={`${questionCount} سؤال`}
        />
        <NavCard
          href="/admin/analytics"
          icon={BarChart2}
          title="التحليلات"
          description="إحصائيات ومتابعة"
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: 'green' | 'yellow' | 'blue' | 'purple'
}) {
  const colors = {
    green: 'text-green-400 bg-green-950',
    yellow: 'text-yellow-400 bg-yellow-950',
    blue: 'text-blue-400 bg-blue-950',
    purple: 'text-purple-400 bg-purple-950',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

function NavCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-green-700 transition-colors group"
    >
      <Icon className="w-5 h-5 text-green-500 mb-3" />
      <h3 className="text-sm font-medium text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </Link>
  )
}
