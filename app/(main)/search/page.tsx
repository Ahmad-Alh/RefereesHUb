'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { laws } from '@/data/laws-2025-26'
import { quickJumps } from '@/data/quick-jumps'
import { searchLaws, getSearchSuggestions } from '@/lib/search'
import { debounce } from '@/lib/utils'
import { Search, BookOpen, ChevronLeft, TrendingUp } from 'lucide-react'
import { toArabicNumerals } from '@/lib/utils'

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)

  const searchResults = useMemo(() => {
    if (query.length < 2) return []
    return searchLaws(laws, query).slice(0, 30)
  }, [query])

  const suggestions = useMemo(() => {
    return getSearchSuggestions(query)
  }, [query])

  const handleSearch = useCallback(
    debounce((value: string) => {
      setQuery(value)
    }, 300),
    []
  )

  const handleQuickJump = (lawId: number, articleId?: string) => {
    if (articleId) {
      router.push(`/law/${lawId}?article=${articleId}`)
    } else {
      router.push(`/law/${lawId}`)
    }
  }

  const handleResultClick = (lawId: number, articleId: string) => {
    router.push(`/law/${lawId}?article=${articleId}&highlight=${encodeURIComponent(query)}`)
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">البحث</h1>
        <p className="text-gray-500 text-sm">ابحث في جميع القوانين الـ ١٧</p>
      </header>

      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="search"
          placeholder="ابحث... (مثال: لمسة يد، تسلل، ركلة جزاء)"
          className="w-full px-4 py-3.5 pr-12 bg-white border border-gray-200 rounded-xl text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm"
          onChange={(e) => {
            handleSearch(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Suggestions */}
      {showSuggestions && query.length < 2 && suggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            اقتراحات البحث
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion)
                  setShowSuggestions(false)
                }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded-full text-sm text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {query.length >= 2 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            نتائج البحث ({toArabicNumerals(searchResults.length)})
          </h3>
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.lawId}-${result.paragraphId}-${index}`}
                  onClick={() => handleResultClick(result.lawId, result.articleId)}
                  className="w-full text-right bg-white p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      القانون {toArabicNumerals(result.lawId)}
                    </span>
                    <span className="text-xs text-gray-500">
                      المادة {result.articleId}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed arabic-text">
                    {result.text}
                  </p>
                  <div className="flex items-center justify-end mt-2 text-xs text-green-600">
                    <span>اذهب للقانون</span>
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد نتائج لـ &quot;{query}&quot;</p>
              <p className="text-gray-400 text-sm mt-1">جرب كلمات بحث مختلفة</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Jumps */}
      {query.length < 2 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            الاختصارات السريعة
          </h3>

          {/* Fouls & Misconduct */}
          <div className="mb-6">
            <h4 className="text-xs text-gray-400 mb-2">الأخطاء والسلوك</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickJumps
                .filter((qj) => qj.lawId === 12 || qj.id === 'offside-offence')
                .slice(0, 6)
                .map((jump) => (
                  <QuickJumpButton
                    key={jump.id}
                    jump={jump}
                    onClick={() => handleQuickJump(jump.lawId, jump.articleId)}
                  />
                ))}
            </div>
          </div>

          {/* Restarts */}
          <div className="mb-6">
            <h4 className="text-xs text-gray-400 mb-2">استئناف اللعب</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickJumps
                .filter((qj) =>
                  [13, 14, 15, 16, 17, 8].includes(qj.lawId) &&
                  !qj.id.includes('offside')
                )
                .slice(0, 6)
                .map((jump) => (
                  <QuickJumpButton
                    key={jump.id}
                    jump={jump}
                    onClick={() => handleQuickJump(jump.lawId, jump.articleId)}
                  />
                ))}
            </div>
          </div>

          {/* Other */}
          <div>
            <h4 className="text-xs text-gray-400 mb-2">أخرى</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickJumps
                .filter((qj) =>
                  ['advantage', 'substitution', 'var', 'added-time', 'goalkeeper-backpass'].includes(qj.id)
                )
                .map((jump) => (
                  <QuickJumpButton
                    key={jump.id}
                    jump={jump}
                    onClick={() => handleQuickJump(jump.lawId, jump.articleId)}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface QuickJumpButtonProps {
  jump: {
    id: string
    labelAr: string
    icon: string
    lawId: number
  }
  onClick: () => void
}

function QuickJumpButton({ jump, onClick }: QuickJumpButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all text-right"
    >
      <span className="text-xl">{jump.icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900 block truncate">
          {jump.labelAr}
        </span>
        <span className="text-xs text-gray-500">القانون {toArabicNumerals(jump.lawId)}</span>
      </div>
    </button>
  )
}
