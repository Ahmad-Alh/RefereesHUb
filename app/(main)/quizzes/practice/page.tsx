'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trophy,
  Target,
  BookOpen
} from 'lucide-react'
import { toArabicNumerals } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  questionTextAr: string
  questionType: string
  imageUrl?: string
  videoUrl?: string
  options: { id: string; textAr: string; orderIndex: number }[]
  lawId?: number
}

interface PracticeSession {
  questions: Question[]
  currentIndex: number
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[]
  isComplete: boolean
}

const QUESTIONS_PER_SESSION = 10

export default function PracticePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<PracticeSession | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null)

  useEffect(() => {
    startNewSession()
  }, [])

  const startNewSession = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/quizzes/practice?count=${QUESTIONS_PER_SESSION}`)
      if (response.ok) {
        const data = await response.json()
        setSession({
          questions: data.questions || [],
          currentIndex: 0,
          answers: [],
          isComplete: false,
        })
      }
    } catch (error) {
      console.error('Failed to start practice session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !session) return

    const currentQuestion = session.questions[session.currentIndex]

    try {
      const response = await fetch('/api/quizzes/practice/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedAnswer,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCorrectAnswer(data.correctAnswer)
        setShowResult(true)

        setSession((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            answers: [
              ...prev.answers,
              {
                questionId: currentQuestion.id,
                selectedAnswer,
                isCorrect: data.isCorrect,
              },
            ],
          }
        })
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const handleNextQuestion = () => {
    if (!session) return

    if (session.currentIndex >= session.questions.length - 1) {
      setSession((prev) => (prev ? { ...prev, isComplete: true } : prev))
    } else {
      setSession((prev) =>
        prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : prev
      )
    }

    setSelectedAnswer(null)
    setShowResult(false)
    setCorrectAnswer(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  if (!session || session.questions.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">لا توجد أسئلة</h2>
          <p className="text-gray-500 mb-4">لم يتم إضافة أسئلة للتدريب بعد</p>
          <button
            onClick={() => router.push('/quizzes')}
            className="text-green-600 font-medium"
          >
            العودة للاختبارات
          </button>
        </div>
      </div>
    )
  }

  // Results Screen
  if (session.isComplete) {
    const correctCount = session.answers.filter((a) => a.isCorrect).length
    const percentage = Math.round((correctCount / session.questions.length) * 100)

    return (
      <div className="px-4 py-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">أحسنت!</h1>
          <p className="text-gray-500 mb-6">لقد أكملت جلسة التدريب</p>

          {/* Score Card */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {toArabicNumerals(percentage)}%
            </div>
            <p className="text-gray-500 mb-4">
              {toArabicNumerals(correctCount)} من {toArabicNumerals(session.questions.length)} إجابة صحيحة
            </p>

            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-lg font-bold text-green-600">
                  {toArabicNumerals(correctCount)}
                </div>
                <div className="text-xs text-gray-500">صحيح</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-lg font-bold text-red-600">
                  {toArabicNumerals(session.questions.length - correctCount)}
                </div>
                <div className="text-xs text-gray-500">خطأ</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={startNewSession}
              className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              تدريب جديد
            </button>
            <button
              onClick={() => router.push('/quizzes')}
              className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              العودة للاختبارات
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = session.questions[session.currentIndex]

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push('/quizzes')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ChevronRight className="w-5 h-5" />
          <span>خروج</span>
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Target className="w-4 h-4" />
          <span>
            {toArabicNumerals(session.currentIndex + 1)} /{' '}
            {toArabicNumerals(session.questions.length)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-6">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{
            width: `${((session.currentIndex + 1) / session.questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
        {currentQuestion.lawId && (
          <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mb-3">
            القانون {toArabicNumerals(currentQuestion.lawId)}
          </span>
        )}

        <h2 className="text-lg font-medium text-gray-900 leading-relaxed arabic-text mb-4">
          {currentQuestion.questionTextAr}
        </h2>

        {currentQuestion.imageUrl && (
          <img
            src={currentQuestion.imageUrl}
            alt="Question image"
            className="w-full rounded-lg mb-4"
          />
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = showResult && correctAnswer === index
            const isWrong = showResult && isSelected && correctAnswer !== index

            return (
              <button
                key={option.id}
                onClick={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-right transition-all',
                  !showResult && isSelected && 'border-green-500 bg-green-50',
                  !showResult && !isSelected && 'border-gray-200 hover:border-gray-300',
                  isCorrect && 'border-green-500 bg-green-50',
                  isWrong && 'border-red-500 bg-red-50',
                  showResult && !isCorrect && !isWrong && 'border-gray-200 opacity-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                      !showResult && isSelected && 'bg-green-500 text-white',
                      !showResult && !isSelected && 'bg-gray-100 text-gray-600',
                      isCorrect && 'bg-green-500 text-white',
                      isWrong && 'bg-red-500 text-white'
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isWrong ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      ['أ', 'ب', 'ج', 'د'][index]
                    )}
                  </span>
                  <span className="flex-1 text-gray-900">{option.textAr}</span>
                </div>
              </button>
            )
          })}
      </div>

      {/* Action Button */}
      {!showResult ? (
        <button
          onClick={handleSubmitAnswer}
          disabled={selectedAnswer === null}
          className={cn(
            'w-full py-3 font-medium rounded-xl transition-colors',
            selectedAnswer !== null
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          تحقق من الإجابة
        </button>
      ) : (
        <button
          onClick={handleNextQuestion}
          className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
        >
          {session.currentIndex >= session.questions.length - 1
            ? 'عرض النتائج'
            : 'السؤال التالي'}
        </button>
      )}
    </div>
  )
}
