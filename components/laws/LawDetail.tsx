'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LawAccordion } from '@/components/laws/LawAccordion'
import { laws } from '@/data/laws-2025-26'
import { toArabicNumerals, getFrequencyBadge } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface LawDetailProps {
  lawId: number
}

export function LawDetail({ lawId }: LawDetailProps) {
  const router = useRouter()
  const law = laws.find((l) => l.id === lawId)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [allExpanded, setAllExpanded] = useState(false)

  if (!law) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-gray-500">القانون غير موجود</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-primary-600 underline"
        >
          العودة للقائمة
        </button>
      </div>
    )
  }

  const badge = getFrequencyBadge(law.frequency)

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const handleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set())
      setAllExpanded(false)
    } else {
      const allIds = new Set<string>()
      law.articles.forEach((article) => {
        allIds.add(article.id)
        article.subsections?.forEach((sub) => allIds.add(sub.id))
      })
      setExpandedIds(allIds)
      setAllExpanded(true)
    }
  }

  // Navigation between laws
  const prevLaw = lawId > 1 ? lawId - 1 : null
  const nextLaw = lawId < 17 ? lawId + 1 : null

  return (
    <div className="px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-gray-600 mb-4 hover:text-primary-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>العودة</span>
      </button>

      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{law.icon}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500">
                القانون {toArabicNumerals(law.id)}
              </span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full border',
                  badge.className
                )}
              >
                {badge.emoji} {badge.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {law.titleAr.replace(/القانون [^ ]+ - /, '')}
            </h1>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {toArabicNumerals(law.articles.length)} مواد
        </p>
      </header>

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleExpandAll}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
            allExpanded
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {allExpanded ? 'طي الكل' : 'توسيع الكل'}
        </button>
      </div>

      {/* Articles */}
      <LawAccordion
        articles={law.articles}
        expandedIds={expandedIds}
        onToggle={handleToggle}
      />

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
        {prevLaw ? (
          <button
            onClick={() => router.push(`/law/${prevLaw}`)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>القانون السابق</span>
          </button>
        ) : (
          <div />
        )}
        {nextLaw ? (
          <button
            onClick={() => router.push(`/law/${nextLaw}`)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <span>القانون التالي</span>
            <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
