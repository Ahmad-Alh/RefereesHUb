'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Loader2,
  FileQuestion,
  BookOpen
} from 'lucide-react'
import { toArabicNumerals } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  questionTextAr: string
  questionType: string
  lawId: number | null
  createdAt: string
  _count: { userAnswers: number }
}

const questionTypeLabels: Record<string, string> = {
  MCQ: 'اختيار متعدد',
  TRUE_FALSE: 'صح/خطأ',
  YELLOW_CARD: 'صفراء',
  RED_CARD: 'حمراء',
  DOGSO: 'DOGSO',
  SPA: 'SPA',
  OFFSIDE: 'تسلل',
  RESTART: 'استئناف',
}

export default function QuestionsListPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterLaw, setFilterLaw] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchQuestions()
  }, [page, filterType, filterLaw])

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      if (filterType) params.append('type', filterType)
      if (filterLaw) params.append('lawId', filterLaw)

      const response = await fetch(`/api/admin/questions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete question:', error)
    }
  }

  const filteredQuestions = searchQuery
    ? questions.filter((q) => q.questionTextAr.includes(searchQuery))
    : questions

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الأسئلة</h1>
          <p className="text-gray-500">
            {toArabicNumerals(questions.length)} سؤال
          </p>
        </div>
        <Link
          href="/admin/questions/new"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة سؤال
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="search"
                placeholder="بحث في الأسئلة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">جميع الأنواع</option>
            {Object.entries(questionTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filterLaw}
            onChange={(e) => {
              setFilterLaw(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">جميع القوانين</option>
            {Array.from({ length: 17 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                القانون {toArabicNumerals(i + 1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">لا توجد أسئلة</p>
          <Link
            href="/admin/questions/new"
            className="inline-block mt-4 text-green-600 font-medium"
          >
            أضف أول سؤال
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">
                  السؤال
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 w-24">
                  النوع
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 w-24">
                  القانون
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 w-24">
                  الإجابات
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 w-24">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-gray-900 line-clamp-2 text-sm">
                      {question.questionTextAr}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {questionTypeLabels[question.questionType] || question.questionType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {question.lawId ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1 w-fit">
                        <BookOpen className="w-3 h-3" />
                        {toArabicNumerals(question.lawId)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {toArabicNumerals(question._count.userAnswers)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/questions/${question.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                السابق
              </button>
              <span className="text-sm text-gray-600">
                {toArabicNumerals(page)} / {toArabicNumerals(totalPages)}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
