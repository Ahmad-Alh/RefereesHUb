'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LawAccordion } from '@/components/laws/LawAccordion'
import { laws } from '@/data/laws-2025-26'
import { toArabicNumerals } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronLeft, Languages } from 'lucide-react'

interface LawDetailProps {
  lawId: number
}

export function LawDetail({ lawId }: LawDetailProps) {
  const router = useRouter()
  const law = laws.find((l) => l.id === lawId)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [allExpanded, setAllExpanded] = useState(false)
  const [showEnglish, setShowEnglish] = useState(false)

  if (!law) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-gray-500">القانون غير موجود</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 text-green-600 underline"
        >
          العودة للقائمة
        </button>
      </div>
    )
  }

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
        className="flex items-center gap-2 text-gray-600 mb-4 hover:text-green-600 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
        <span>{showEnglish ? 'Back' : 'العودة'}</span>
      </button>

      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{law.icon}</span>
          <div className="flex-1">
            <span className="text-sm text-gray-500">
              {showEnglish ? `Law ${law.id}` : `القانون ${toArabicNumerals(law.id)}`}
            </span>
            <h1 className="text-xl font-bold text-gray-900">
              {showEnglish
                ? law.titleEn
                : law.titleAr.replace(/القانون [^ ]+ - /, '')}
            </h1>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {showEnglish
            ? `${law.articles.length} articles`
            : `${toArabicNumerals(law.articles.length)} مادة`}
        </p>
      </header>

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleExpandAll}
          className={cn(
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
            allExpanded
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {allExpanded
            ? (showEnglish ? 'Collapse All' : 'طي الكل')
            : (showEnglish ? 'Expand All' : 'توسيع الكل')}
        </button>
        <button
          onClick={() => setShowEnglish(!showEnglish)}
          className={cn(
            'py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
            showEnglish
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <Languages className="w-4 h-4" />
          {showEnglish ? 'العربية' : 'English'}
        </button>
      </div>

      {/* Articles */}
      <LawAccordion
        articles={law.articles}
        expandedIds={expandedIds}
        onToggle={handleToggle}
        showEnglish={showEnglish}
      />

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
        {prevLaw ? (
          <button
            onClick={() => router.push(`/law/${prevLaw}`)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <ChevronRight className="w-5 h-5" />
            <span>{showEnglish ? 'Previous Law' : 'القانون السابق'}</span>
          </button>
        ) : (
          <div />
        )}
        {nextLaw ? (
          <button
            onClick={() => router.push(`/law/${nextLaw}`)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <span>{showEnglish ? 'Next Law' : 'القانون التالي'}</span>
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
