import { getStats } from '@/lib/video-store'
import { BarChart2, Video } from 'lucide-react'
import { sampleQuestions } from '@/data/sample-questions'

export const dynamic = 'force-dynamic'

export default function AnalyticsPage() {
  const { total, published, drafts } = getStats()
  const publishRate = total > 0 ? Math.round((published / total) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">التحليلات</h1>
        <p className="text-gray-600 text-sm mt-0.5">إحصائيات المحتوى</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBlock icon={Video} label="إجمالي الفيديوهات" value={total} />
        <StatBlock icon={Video} label="منشور" value={published} />
        <StatBlock icon={Video} label="مسودة" value={drafts} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-green-500" />
          معدل النشر
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">الفيديوهات المنشورة</span>
            <span className="text-gray-900">{publishRate}%</span>
          </div>
          <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${publishRate}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">أسئلة التدريب</h2>
        <p className="text-3xl font-bold text-gray-900">{sampleQuestions.length}</p>
        <p className="text-xs text-gray-600 mt-1">سؤال في البنك</p>
      </div>
    </div>
  )
}

function StatBlock({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <Icon className="w-5 h-5 text-green-500 mb-3" />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-0.5">{label}</p>
    </div>
  )
}
