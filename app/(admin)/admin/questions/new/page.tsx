'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Image,
  Video
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toArabicNumerals } from '@/lib/utils'

type QuestionType =
  | 'MCQ'
  | 'TRUE_FALSE'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'DOGSO'
  | 'SPA'
  | 'OFFSIDE'
  | 'RESTART'

interface QuestionOption {
  textAr: string
  textEn?: string
}

const questionTypeLabels: Record<QuestionType, string> = {
  MCQ: 'اختيار من متعدد',
  TRUE_FALSE: 'صح / خطأ',
  YELLOW_CARD: 'قرار البطاقة الصفراء',
  RED_CARD: 'قرار البطاقة الحمراء',
  DOGSO: 'حرمان من فرصة واضحة (DOGSO)',
  SPA: 'إيقاف هجمة واعدة (SPA)',
  OFFSIDE: 'موقف التسلل',
  RESTART: 'استئناف اللعب',
}

const offsideOptions = [
  { value: 0, label: 'التدخل في اللعب' },
  { value: 1, label: 'التدخل مع الخصم' },
  { value: 2, label: 'اكتساب ميزة' },
  { value: 3, label: 'لا يوجد تسلل' },
]

const restartOptions = [
  { value: 0, label: 'ركلة حرة مباشرة' },
  { value: 1, label: 'ركلة حرة غير مباشرة' },
  { value: 2, label: 'ركلة جزاء' },
  { value: 3, label: 'إسقاط كرة' },
  { value: 4, label: 'ركلة مرمى' },
  { value: 5, label: 'ركلة ركنية' },
  { value: 6, label: 'رمية تماس' },
]

export default function NewQuestionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    questionTextAr: '',
    questionTextEn: '',
    questionType: 'MCQ' as QuestionType,
    imageUrl: '',
    videoUrl: '',
    correctAnswer: 0,
    lawId: '',
    articleId: '',
    explanationAr: '',
    explanationEn: '',
    addToPractice: true,
  })

  const [options, setOptions] = useState<QuestionOption[]>([
    { textAr: '' },
    { textAr: '' },
    { textAr: '' },
    { textAr: '' },
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate MCQ options
      if (formData.questionType === 'MCQ') {
        const filledOptions = options.filter((opt) => opt.textAr.trim())
        if (filledOptions.length < 2) {
          throw new Error('يجب إضافة خيارين على الأقل')
        }
      }

      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lawId: formData.lawId ? parseInt(formData.lawId) : null,
          options: formData.questionType === 'MCQ' ? options.filter((opt) => opt.textAr.trim()) : [],
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'فشل في إنشاء السؤال')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/questions')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { textAr: '' }])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      if (formData.correctAnswer >= newOptions.length) {
        setFormData((prev) => ({ ...prev, correctAnswer: newOptions.length - 1 }))
      }
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], textAr: value }
    setOptions(newOptions)
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">تم إنشاء السؤال بنجاح</h2>
        <p className="text-gray-600">جاري تحويلك لقائمة الأسئلة...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/questions')}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-700 mb-4"
        >
          <ChevronRight className="w-5 h-5" />
          <span>العودة</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">إضافة سؤال جديد</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 border border-gray-100">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع السؤال
          </label>
          <select
            value={formData.questionType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                questionType: e.target.value as QuestionType,
                correctAnswer: 0,
              }))
            }
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {Object.entries(questionTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نص السؤال (عربي) *
          </label>
          <textarea
            value={formData.questionTextAr}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, questionTextAr: e.target.value }))
            }
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
            placeholder="أدخل نص السؤال..."
            required
          />
        </div>

        {/* Media URLs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline ml-1" />
              رابط الصورة (اختياري)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://..."
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Video className="w-4 h-4 inline ml-1" />
              رابط الفيديو (اختياري)
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))
              }
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://..."
              dir="ltr"
            />
          </div>
        </div>

        {/* Answer Options - MCQ */}
        {formData.questionType === 'MCQ' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              خيارات الإجابة *
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, correctAnswer: index }))
                    }
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                      formData.correctAnswer === index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {['أ', 'ب', 'ج', 'د', 'هـ', 'و'][index]}
                  </button>
                  <input
                    type="text"
                    value={option.textAr}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`الخيار ${['أ', 'ب', 'ج', 'د', 'هـ', 'و'][index]}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  إضافة خيار
                </button>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              اضغط على الحرف لتحديد الإجابة الصحيحة
            </p>
          </div>
        )}

        {/* Answer Options - Yes/No types */}
        {['TRUE_FALSE', 'YELLOW_CARD', 'RED_CARD', 'DOGSO', 'SPA'].includes(
          formData.questionType
        ) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الإجابة الصحيحة *
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, correctAnswer: 1 }))}
                className={cn(
                  'flex-1 py-3 rounded-xl font-medium transition-colors',
                  formData.correctAnswer === 1
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {formData.questionType === 'TRUE_FALSE' ? 'صح' : 'نعم'}
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, correctAnswer: 0 }))}
                className={cn(
                  'flex-1 py-3 rounded-xl font-medium transition-colors',
                  formData.correctAnswer === 0
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {formData.questionType === 'TRUE_FALSE' ? 'خطأ' : 'لا'}
              </button>
            </div>
          </div>
        )}

        {/* Answer Options - Offside */}
        {formData.questionType === 'OFFSIDE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الإجابة الصحيحة *
            </label>
            <div className="space-y-2">
              {offsideOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, correctAnswer: option.value }))
                  }
                  className={cn(
                    'w-full p-3 rounded-xl text-right transition-colors',
                    formData.correctAnswer === option.value
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Answer Options - Restart */}
        {formData.questionType === 'RESTART' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الإجابة الصحيحة *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {restartOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, correctAnswer: option.value }))
                  }
                  className={cn(
                    'p-3 rounded-xl text-center text-sm transition-colors',
                    formData.correctAnswer === option.value
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Law Reference */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ربط بالقانون (اختياري)
            </label>
            <select
              value={formData.lawId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lawId: e.target.value }))
              }
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">اختر القانون</option>
              {Array.from({ length: 17 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  القانون {toArabicNumerals(i + 1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم المادة (اختياري)
            </label>
            <input
              type="text"
              value={formData.articleId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, articleId: e.target.value }))
              }
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="مثال: 12.2"
              dir="ltr"
            />
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الشرح (اختياري)
          </label>
          <textarea
            value={formData.explanationAr}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, explanationAr: e.target.value }))
            }
            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px]"
            placeholder="أضف شرحاً للإجابة الصحيحة..."
          />
        </div>

        {/* Add to Practice Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <span className="font-medium text-gray-700">إضافة لبنك التدريب</span>
            <p className="text-sm text-gray-600">
              سيظهر السؤال في وضع التدريب الشخصي
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, addToPractice: !prev.addToPractice }))
            }
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              formData.addToPractice ? 'bg-green-500' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
                formData.addToPractice ? 'right-1' : 'right-7'
              )}
            />
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            'حفظ السؤال'
          )}
        </button>
      </form>
    </div>
  )
}
