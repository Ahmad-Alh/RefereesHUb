'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Search,
  Calendar,
  ClipboardList,
  User,
  Loader2,
  FileText,
  Filter,
  Trash2,
  Edit
} from 'lucide-react'
import { formatDateAr } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MatchNote {
  id: string
  matchDate: string
  matchTime: string | null
  matchName: string
  hasEvaluator: boolean
  evaluatorFeedback: string | null
  personalNotes: string | null
  createdAt: string
}

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<MatchNote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEvaluator, setFilterEvaluator] = useState<boolean | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [filterEvaluator])

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams()
      if (filterEvaluator !== null) {
        params.append('hasEvaluator', filterEvaluator.toString())
      }

      const response = await fetch(`/api/notes?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    } finally {
      setDeleteId(null)
    }
  }

  const filteredNotes = searchQuery
    ? notes.filter(
        (note) =>
          note.matchName.includes(searchQuery) ||
          note.personalNotes?.includes(searchQuery) ||
          note.evaluatorFeedback?.includes(searchQuery)
      )
    : notes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">ملاحظات المباريات</h1>
        <p className="text-gray-500 text-sm">سجل ملاحظاتك وتقييمات المقيمين</p>
      </header>

      {/* Add New Button */}
      <Link
        href="/notes/new"
        className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors mb-6"
      >
        <Plus className="w-5 h-5" />
        إضافة ملاحظة جديدة
      </Link>

      {/* Search & Filters */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <input
            type="search"
            placeholder="ابحث في الملاحظات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterEvaluator(null)}
            className={cn(
              'flex-1 py-2 px-3 text-sm rounded-lg transition-colors',
              filterEvaluator === null
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterEvaluator(true)}
            className={cn(
              'flex-1 py-2 px-3 text-sm rounded-lg transition-colors flex items-center justify-center gap-1',
              filterEvaluator === true
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <User className="w-4 h-4" />
            مع مقيم
          </button>
          <button
            onClick={() => setFilterEvaluator(false)}
            className={cn(
              'flex-1 py-2 px-3 text-sm rounded-lg transition-colors',
              filterEvaluator === false
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            بدون مقيم
          </button>
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery
              ? `لا توجد نتائج لـ "${searchQuery}"`
              : 'لا توجد ملاحظات بعد'}
          </p>
          {!searchQuery && (
            <Link
              href="/notes/new"
              className="inline-block mt-4 text-green-600 font-medium"
            >
              أضف أول ملاحظة
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {note.matchName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateAr(new Date(note.matchDate))}
                      </span>
                      {note.matchTime && <span>{note.matchTime}</span>}
                    </div>
                  </div>
                  {note.hasEvaluator && (
                    <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <User className="w-3 h-3" />
                      مع مقيم
                    </span>
                  )}
                </div>

                {/* Evaluator Feedback */}
                {note.hasEvaluator && note.evaluatorFeedback && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-xs font-medium text-blue-700 mb-1">
                      ملاحظات المقيم
                    </h4>
                    <p className="text-sm text-blue-900 line-clamp-2">
                      {note.evaluatorFeedback}
                    </p>
                  </div>
                )}

                {/* Personal Notes */}
                {note.personalNotes && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">
                      ملاحظاتي
                    </h4>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {note.personalNotes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/notes/${note.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Link>
                  <button
                    onClick={() => setDeleteId(note.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">حذف الملاحظة</h3>
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
