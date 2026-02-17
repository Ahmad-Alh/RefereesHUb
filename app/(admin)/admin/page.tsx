import Link from 'next/link'
import { getStats } from '@/lib/video-store'
import { Video, FileQuestion, BarChart2, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  const { total, published, drafts } = getStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600 text-sm mt-0.5">نظرة عامة على المحتوى</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="فيديوهات منشورة" value={published} icon={Video} color="green" />
        <StatCard label="مسودات" value={drafts} icon={Video} color="yellow" />
        <StatCard label="إجمالي الفيديوهات" value={total} icon={Video} color="blue" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/videos/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-gray-900 text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة فيديو
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NavCard href="/admin/videos" icon={Video} title="إدارة الفيديوهات" description={`${published} منشور · ${drafts} مسودة`} />
        <NavCard href="/admin/analytics" icon={BarChart2} title="التحليلات" description="إحصائيات المحتوى" />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: 'green' | 'yellow' | 'blue' }) {
  const colors = { green: 'text-green-700 bg-green-50', yellow: 'text-yellow-400 bg-yellow-950', blue: 'text-blue-400 bg-blue-950' }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-0.5">{label}</p>
    </div>
  )
}

function NavCard({ href, icon: Icon, title, description }: { href: string; icon: React.ElementType; title: string; description: string }) {
  return (
    <Link href={href} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-green-700 transition-colors">
      <Icon className="w-5 h-5 text-green-500 mb-3" />
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </Link>
  )
}
