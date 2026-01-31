import type { Law, SearchResult } from '@/types'

// Normalize Arabic text for search
export function normalizeArabic(text: string): string {
  return text
    // Remove diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize alef variants to bare alef
    .replace(/[إأآا]/g, 'ا')
    // Normalize teh marbuta to heh
    .replace(/ة/g, 'ه')
    // Normalize alef maksura to yeh
    .replace(/ى/g, 'ي')
    // Remove tatweel (kashida)
    .replace(/ـ/g, '')
    // Trim and lowercase
    .trim()
    .toLowerCase()
}

// Search within laws
export function searchLaws(laws: Law[], query: string): SearchResult[] {
  if (!query || query.length < 2) return []

  const normalizedQuery = normalizeArabic(query)
  const results: SearchResult[] = []

  for (const law of laws) {
    for (const article of law.articles) {
      // Search in article content
      for (const paragraph of article.content) {
        const normalizedText = normalizeArabic(paragraph.textAr)
        const index = normalizedText.indexOf(normalizedQuery)

        if (index !== -1) {
          results.push({
            lawId: law.id,
            articleId: article.id,
            paragraphId: paragraph.id,
            text: paragraph.textAr,
            matchStart: index,
            matchEnd: index + normalizedQuery.length,
          })
        }
      }

      // Search in subsections
      if (article.subsections) {
        for (const subsection of article.subsections) {
          for (const paragraph of subsection.content) {
            const normalizedText = normalizeArabic(paragraph.textAr)
            const index = normalizedText.indexOf(normalizedQuery)

            if (index !== -1) {
              results.push({
                lawId: law.id,
                articleId: article.id,
                paragraphId: paragraph.id,
                text: paragraph.textAr,
                matchStart: index,
                matchEnd: index + normalizedQuery.length,
              })
            }
          }
        }
      }
    }
  }

  return results
}

// Highlight search term in text
export function highlightSearchTerm(text: string, query: string): string {
  if (!query) return text

  const normalizedQuery = normalizeArabic(query)
  const normalizedText = normalizeArabic(text)

  // Find all occurrences in normalized text
  const indices: number[] = []
  let pos = 0
  while ((pos = normalizedText.indexOf(normalizedQuery, pos)) !== -1) {
    indices.push(pos)
    pos += normalizedQuery.length
  }

  if (indices.length === 0) return text

  // Build result with highlights
  // Note: This is a simplified version. For accurate highlighting,
  // we'd need to map normalized indices back to original text.
  // For now, we'll use a simple regex approach
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')

  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

// Get search suggestions based on common terms
export function getSearchSuggestions(query: string): string[] {
  const commonTerms = [
    'لمسة يد',
    'التسلل',
    'ركلة جزاء',
    'ركلة حرة',
    'البطاقة الصفراء',
    'البطاقة الحمراء',
    'رمية التماس',
    'ركلة المرمى',
    'ركلة الركنية',
    'حارس المرمى',
    'الكرة داخل وخارج اللعب',
    'بداية واستئناف اللعب',
    'السلوك العنيف',
    'اللعب الخطر',
    'عرقلة',
    'إعاقة الخصم',
    'الوقت الضائع',
    'الوقت الإضافي',
    'ضربات الترجيح',
  ]

  if (!query) return commonTerms.slice(0, 6)

  const normalizedQuery = normalizeArabic(query)
  return commonTerms
    .filter(term => normalizeArabic(term).includes(normalizedQuery))
    .slice(0, 8)
}

// Extract context around a match
export function extractContext(text: string, matchStart: number, matchEnd: number, contextLength: number = 50): string {
  const start = Math.max(0, matchStart - contextLength)
  const end = Math.min(text.length, matchEnd + contextLength)

  let context = text.slice(start, end)

  if (start > 0) context = '...' + context
  if (end < text.length) context = context + '...'

  return context
}
