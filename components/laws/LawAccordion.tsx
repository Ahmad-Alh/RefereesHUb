'use client'

import { useState } from 'react'
import type { Article, Subsection, Paragraph } from '@/types'
import { cn } from '@/lib/utils'

interface LawAccordionProps {
  articles: Article[]
  expandedIds: Set<string>
  onToggle: (id: string) => void
}

export function LawAccordion({ articles, expandedIds, onToggle }: LawAccordionProps) {
  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <ArticleAccordion
          key={article.id}
          article={article}
          isExpanded={expandedIds.has(article.id)}
          expandedIds={expandedIds}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

interface ArticleAccordionProps {
  article: Article
  isExpanded: boolean
  expandedIds: Set<string>
  onToggle: (id: string) => void
}

function ArticleAccordion({ article, isExpanded, expandedIds, onToggle }: ArticleAccordionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <button
        className={cn(
          'w-full px-4 py-3 flex items-center justify-between text-right transition-colors',
          isExpanded ? 'bg-primary-50 border-b border-primary-100' : 'hover:bg-gray-50'
        )}
        onClick={() => onToggle(article.id)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
            {article.id}
          </span>
          <h3 className="font-semibold text-gray-900">{article.titleAr}</h3>
        </div>
        <svg
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform duration-300',
            isExpanded ? 'rotate-180' : ''
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      <div
        className={cn(
          'accordion-content',
          isExpanded ? 'max-h-[2000px]' : 'max-h-0'
        )}
      >
        <div className="p-4 space-y-4">
          {/* Main paragraphs */}
          {article.content.length > 0 && (
            <div className="space-y-2">
              {article.content.map((paragraph) => (
                <ParagraphText key={paragraph.id} paragraph={paragraph} />
              ))}
            </div>
          )}

          {/* Subsections */}
          {article.subsections && article.subsections.length > 0 && (
            <div className="space-y-3 mr-4 border-r-2 border-primary-200 pr-4">
              {article.subsections.map((subsection) => (
                <SubsectionAccordion
                  key={subsection.id}
                  subsection={subsection}
                  isExpanded={expandedIds.has(subsection.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface SubsectionAccordionProps {
  subsection: Subsection
  isExpanded: boolean
  onToggle: (id: string) => void
}

function SubsectionAccordion({ subsection, isExpanded, onToggle }: SubsectionAccordionProps) {
  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden">
      <button
        className={cn(
          'w-full px-3 py-2 flex items-center justify-between text-right text-sm transition-colors',
          isExpanded ? 'bg-primary-100' : 'hover:bg-gray-100'
        )}
        onClick={() => onToggle(subsection.id)}
      >
        <h4 className="font-medium text-gray-800">{subsection.titleAr}</h4>
        <svg
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform duration-300',
            isExpanded ? 'rotate-180' : ''
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={cn(
          'accordion-content',
          isExpanded ? 'max-h-[1000px]' : 'max-h-0'
        )}
      >
        <div className="p-3 space-y-2">
          {subsection.content.map((paragraph) => (
            <ParagraphText key={paragraph.id} paragraph={paragraph} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ParagraphTextProps {
  paragraph: Paragraph
}

function ParagraphText({ paragraph }: ParagraphTextProps) {
  const [isHighlighted, setIsHighlighted] = useState(false)

  return (
    <p
      className={cn(
        'arabic-text text-gray-700 leading-loose highlightable select-text cursor-text',
        isHighlighted && 'bg-yellow-100 rounded px-1'
      )}
      onDoubleClick={() => setIsHighlighted(!isHighlighted)}
    >
      {paragraph.textAr}
    </p>
  )
}
