'use client'

import { FileText } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <div className="px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">المستندات</h1>
        <p className="text-gray-500 text-sm">المستندات والملفات المرجعية</p>
      </header>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">لا توجد مستندات</h2>
        <p className="text-gray-500 text-center max-w-xs">
          سيتم إضافة المستندات والملفات المرجعية قريباً
        </p>
      </div>
    </div>
  )
}
