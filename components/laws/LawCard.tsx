'use client'

import Link from 'next/link'
import type { Law } from '@/types'
import { toArabicNumerals, getFrequencyBadge } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface LawCardProps {
  law: Law
}

export function LawCard({ law }: LawCardProps) {
  const badge = getFrequencyBadge(law.frequency)
  const articleCount = law.articles.length

  return (
    <Link href={`/law/${law.id}`}>
      <div className="law-card group">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="text-3xl flex-shrink-0">{law.icon}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Law number and frequency badge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">
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

            {/* Title */}
            <h3 className="font-semibold text-gray-900 leading-tight mb-1 group-hover:text-primary-600 transition-colors">
              {law.titleAr.replace(/القانون [^ ]+ - /, '')}
            </h3>

            {/* Article count */}
            <p className="text-sm text-gray-500">
              {toArabicNumerals(articleCount)} مواد
            </p>
          </div>

          {/* Arrow */}
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0 rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
