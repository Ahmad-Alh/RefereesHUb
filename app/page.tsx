'use client'

import { useState } from 'react'
import { LawCard } from '@/components/laws/LawCard'
import { laws } from '@/data/laws-2025-26'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const [showHighFrequencyOnly, setShowHighFrequencyOnly] = useState(false)

  const filteredLaws = showHighFrequencyOnly
    ? laws.filter((law) => law.frequency === 'high')
    : laws

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          قوانين اللعبة
        </h1>
        <p className="text-gray-500 text-sm">
          IFAB 2025/26 - النسخة العربية الرسمية
        </p>
      </header>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-xl border border-gray-100">
        <span className="text-sm text-gray-600">عرض القوانين المتكررة فقط</span>
        <button
          onClick={() => setShowHighFrequencyOnly(!showHighFrequencyOnly)}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            showHighFrequencyOnly ? 'bg-primary-500' : 'bg-gray-300'
          )}
        >
          <span
            className={cn(
              'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
              showHighFrequencyOnly ? 'right-1' : 'right-7'
            )}
          />
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-6 text-xs">
        <span className="flex items-center gap-1">
          <span className="badge-high px-2 py-0.5 rounded-full border">🔥 متكرر</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="badge-medium px-2 py-0.5 rounded-full border">⚠️ شائع</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="badge-low px-2 py-0.5 rounded-full border">📘 نادر</span>
        </span>
      </div>

      {/* Laws Grid */}
      <div className="space-y-3">
        {filteredLaws.map((law, index) => (
          <div
            key={law.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <LawCard law={law} />
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          {showHighFrequencyOnly
            ? `عرض ${filteredLaws.length} قوانين متكررة من أصل ١٧`
            : 'جميع القوانين الـ ١٧'}
        </p>
      </div>
    </div>
  )
}
