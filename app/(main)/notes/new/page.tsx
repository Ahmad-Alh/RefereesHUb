'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NewNotePage() {
  const { status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    matchDate: new Date().toISOString().split('T')[0],
    matchTime: '',
    matchName: '',
    hasEvaluator: false,
    evaluatorFeedback: '',
    personalNotes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'فشل في حفظ الملاحظة')
      }

      router.push('/notes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/notes/new')
    return null
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/notes')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronRight className="w-5 h-5" />
          <span>العودة</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">إضافة ملاحظة جديدة</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              التاريخ
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.matchDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, matchDate: e.target.value }))
                }
                className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوقت
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.matchTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, matchTime: e.target.value }))
                }
                className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Match Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المباراة
          </label>
          <input
            type="text"
            value={formData.matchName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, matchName: e.target.value }))
            }
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="مثال: الشارقة vs العين"
            required
          />
        </div>

        {/* Has Evaluator Toggle */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
          <span className="text-gray-700">يوجد مقيم؟</span>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, hasEvaluator: !prev.hasEvaluator }))
            }
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              formData.hasEvaluator ? 'bg-green-500' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
                formData.hasEvaluator ? 'right-1' : 'right-7'
              )}
            />
          </button>
        </div>

        {/* Evaluator Feedback */}
        {formData.hasEvaluator && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ملاحظات المقيم
            </label>
            <textarea
              value={formData.evaluatorFeedback}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  evaluatorFeedback: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[120px] resize-none"
              placeholder="أدخل ملاحظات المقيم هنا..."
            />
          </div>
        )}

        {/* Personal Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ملاحظاتي الشخصية
          </label>
          <textarea
            value={formData.personalNotes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, personalNotes: e.target.value }))
            }
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[150px] resize-none"
            placeholder="سجل ملاحظاتك وانطباعاتك عن المباراة..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            'حفظ الملاحظة'
          )}
        </button>
      </form>
    </div>
  )
}
