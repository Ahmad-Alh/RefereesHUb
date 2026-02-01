'use client'

import { useState } from 'react'
import Link from 'next/link'
import { laws } from '@/data/laws-2025-26'
import { toArabicNumerals } from '@/lib/utils'
import { Search, BookOpen, ChevronLeft } from 'lucide-react'

export default function LawsHomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLaws = searchQuery
    ? laws.filter(
        (law) =>
          law.titleAr.includes(searchQuery) ||
          law.titleEn.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : laws

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">قوانين اللعبة</h1>
        <p className="text-gray-500 text-sm">IFAB 2025/26 - النسخة العربية الرسمية</p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="search"
          placeholder="ابحث في القوانين..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Quick Shortcuts */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">اختصارات سريعة</h2>
        <div className="grid grid-cols-3 gap-2">
          <QuickShortcut href="/law/12?article=12.1" icon="✋" label="لمسة اليد" />
          <QuickShortcut href="/law/11" icon="🚩" label="التسلل" />
          <QuickShortcut href="/law/14" icon="⚽" label="ركلة الجزاء" />
          <QuickShortcut href="/law/12?article=12.3" icon="🟨" label="البطاقات" />
          <QuickShortcut href="/law/13" icon="🎯" label="الركلات الحرة" />
          <QuickShortcut href="/law/5" icon="👨‍⚖️" label="الحكم" />
        </div>
      </div>

      {/* Laws Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-500 mb-3">جميع القوانين ({toArabicNumerals(17)})</h2>
        {filteredLaws.map((law, index) => (
          <Link
            key={law.id}
            href={`/law/${law.id}`}
            className="block bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all animate-slide-up"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {law.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-0.5 truncate">
                  {law.titleAr}
                </h3>
                <p className="text-xs text-gray-500">
                  {toArabicNumerals(law.articles.length)} مادة
                </p>
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      {filteredLaws.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">لا توجد نتائج لـ &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  )
}

function QuickShortcut({
  href,
  icon,
  label,
}: {
  href: string
  icon: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all"
    >
      <span className="text-xl mb-1">{icon}</span>
      <span className="text-xs text-gray-700">{label}</span>
    </Link>
  )
}
