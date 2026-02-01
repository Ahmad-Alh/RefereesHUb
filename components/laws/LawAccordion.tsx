'use client'

import { useState } from 'react'
import type { Article, Subsection, Paragraph } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface LawAccordionProps {
  articles: Article[]
  expandedIds: Set<string>
  onToggle: (id: string) => void
  showEnglish?: boolean
}

export function LawAccordion({ articles, expandedIds, onToggle, showEnglish = false }: LawAccordionProps) {
  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <ArticleAccordion
          key={article.id}
          article={article}
          isExpanded={expandedIds.has(article.id)}
          expandedIds={expandedIds}
          onToggle={onToggle}
          showEnglish={showEnglish}
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
  showEnglish: boolean
}

function ArticleAccordion({ article, isExpanded, expandedIds, onToggle, showEnglish }: ArticleAccordionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <button
        className={cn(
          'w-full px-4 py-3 flex items-center justify-between text-right transition-colors',
          isExpanded ? 'bg-green-50 border-b border-green-100' : 'hover:bg-gray-50'
        )}
        onClick={() => onToggle(article.id)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
            {article.id}
          </span>
          <h3 className="font-semibold text-gray-900">
            {showEnglish && article.titleEn ? article.titleEn : article.titleAr}
          </h3>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform duration-300',
            isExpanded ? 'rotate-180' : ''
          )}
        />
      </button>

      {/* Content */}
      <div
        className={cn(
          'accordion-content',
          isExpanded ? 'max-h-[5000px]' : 'max-h-0'
        )}
      >
        <div className="p-4 space-y-4">
          {/* Main paragraphs */}
          {article.content.length > 0 && (
            <div className="space-y-2">
              {article.content.map((paragraph) => (
                <ParagraphText
                  key={paragraph.id}
                  paragraph={paragraph}
                  showEnglish={showEnglish}
                />
              ))}
            </div>
          )}

          {/* Subsections */}
          {article.subsections && article.subsections.length > 0 && (
            <div className="space-y-3 mr-4 border-r-2 border-green-200 pr-4">
              {article.subsections.map((subsection) => (
                <SubsectionAccordion
                  key={subsection.id}
                  subsection={subsection}
                  isExpanded={expandedIds.has(subsection.id)}
                  onToggle={onToggle}
                  showEnglish={showEnglish}
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
  showEnglish: boolean
}

function SubsectionAccordion({ subsection, isExpanded, onToggle, showEnglish }: SubsectionAccordionProps) {
  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden">
      <button
        className={cn(
          'w-full px-3 py-2 flex items-center justify-between text-right text-sm transition-colors',
          isExpanded ? 'bg-green-100' : 'hover:bg-gray-100'
        )}
        onClick={() => onToggle(subsection.id)}
      >
        <h4 className="font-medium text-gray-800">
          {showEnglish && subsection.titleEn ? subsection.titleEn : subsection.titleAr}
        </h4>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform duration-300',
            isExpanded ? 'rotate-180' : ''
          )}
        />
      </button>

      <div
        className={cn(
          'accordion-content',
          isExpanded ? 'max-h-[2000px]' : 'max-h-0'
        )}
      >
        <div className="p-3 space-y-2">
          {subsection.content.map((paragraph) => (
            <ParagraphText
              key={paragraph.id}
              paragraph={paragraph}
              showEnglish={showEnglish}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ParagraphTextProps {
  paragraph: Paragraph
  showEnglish: boolean
}

function ParagraphText({ paragraph, showEnglish }: ParagraphTextProps) {
  const [isHighlighted, setIsHighlighted] = useState(false)

  const text = showEnglish && paragraph.textEn ? paragraph.textEn : paragraph.textAr

  return (
    <p
      className={cn(
        'text-gray-700 leading-loose highlightable select-text cursor-text',
        showEnglish ? 'text-left' : 'arabic-text',
        isHighlighted && 'bg-yellow-100 rounded px-1'
      )}
      onDoubleClick={() => setIsHighlighted(!isHighlighted)}
      dir={showEnglish ? 'ltr' : 'rtl'}
    >
      {text}
    </p>
  )
}
