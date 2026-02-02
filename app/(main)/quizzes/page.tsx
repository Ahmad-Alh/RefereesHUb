'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap,
  BookOpen,
  Clock,
  Trophy,
  ChevronLeft,
  Play,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { toArabicNumerals, formatDateAr } from '@/lib/utils'

interface Quiz {
  id: string
  titleAr: string
  descriptionAr: string | null
  questionCount: number
  publishedAt: string
  userAttempt?: {
    score: number
    completedAt: string
  }
}

export default function QuizzesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [practiceCount, setPracticeCount] = useState(0)

  useEffect(() => {
    fetchQuizzes()
    fetchPracticeCount()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes')
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.quizzes || [])
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPracticeCount = async () => {
    try {
      const response = await fetch('/api/quizzes/practice/count')
      if (response.ok) {
        const data = await response.json()
        setPracticeCount(data.count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch practice count:', error)
    }
  }

  if (status === 'loading' || loading) {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">الاختبارات</h1>
        <p className="text-gray-500 text-sm">اختبر معرفتك بقوانين اللعبة</p>
      </header>

      {/* Practice Mode Card */}
      <Link
        href="/quizzes/practice"
        className="block bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 mb-6 text-white"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold mb-1">تدريب شخصي</h2>
            <p className="text-green-100 text-sm">
              تدرب على أسئلة عشوائية من بنك الأسئلة
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-100">
            {toArabicNumerals(practiceCount)} سؤال متاح
          </span>
          <span className="flex items-center gap-1 text-sm font-medium">
            ابدأ التدريب
            <ChevronLeft className="w-4 h-4" />
          </span>
        </div>
      </Link>

      {/* Published Quizzes */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          اختبارات منشورة
        </h2>

        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد اختبارات منشورة حالياً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const isCompleted = !!quiz.userAttempt

  return (
    <Link
      href={`/quizzes/${quiz.id}`}
      className="block bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900">{quiz.titleAr}</h3>
          {isCompleted ? (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
              مكتمل
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <Play className="w-3 h-3" />
              جديد
            </span>
          )}
        </div>

        {quiz.descriptionAr && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {quiz.descriptionAr}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {toArabicNumerals(quiz.questionCount)} سؤال
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateAr(new Date(quiz.publishedAt))}
          </span>
        </div>

        {isCompleted && quiz.userAttempt && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">نتيجتك</span>
            <span className="flex items-center gap-1 font-medium text-green-600">
              <Trophy className="w-4 h-4" />
              {toArabicNumerals(quiz.userAttempt.score)}%
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
