import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import VideoForm from '../VideoForm'

export default function NewVideoPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin/videos" className="hover:text-gray-700 transition-colors">
          الفيديوهات
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300">فيديو جديد</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900">إضافة فيديو جديد</h1>

      <VideoForm />
    </div>
  )
}
