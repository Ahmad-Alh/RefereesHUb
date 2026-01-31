'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFlashcardsStore } from '@/lib/store'
import { laws } from '@/data/laws-2025-26'
import { getDueCards, calculateStats, updateFlashcardWithSM2, createFlashcard } from '@/lib/sm2'
import { toArabicNumerals } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Flashcard, ReviewRating } from '@/types'

// Sample admin flashcards for demonstration
const sampleFlashcards: Omit<Flashcard, 'interval' | 'repetition' | 'easeFactor' | 'nextReview' | 'createdAt'>[] = [
  {
    id: 'admin-1',
    type: 'admin',
    lawId: 11,
    articleId: '11.1',
    frontAr: 'متى يكون اللاعب في وضع تسلل؟',
    backAr: 'يكون اللاعب في وضع تسلل إذا كان أي جزء من رأسه أو جسمه أو قدميه أقرب إلى خط مرمى الخصم من الكرة وثاني آخر خصم.',
  },
  {
    id: 'admin-2',
    type: 'admin',
    lawId: 12,
    articleId: '12.1',
    frontAr: 'متى تُحتسب لمسة اليد مخالفة؟',
    backAr: 'تُمنح ركلة حرة مباشرة إذا لمس اللاعب الكرة بيده/ذراعه عمداً، بما في ذلك تحريك اليد/الذراع نحو الكرة، أو بعد جعل جسمه أكبر بشكل غير طبيعي.',
  },
  {
    id: 'admin-3',
    type: 'admin',
    lawId: 14,
    articleId: '14.2',
    frontAr: 'ما هو وضع حارس المرمى عند تنفيذ ركلة الجزاء؟',
    backAr: 'يجب أن يكون حارس مرمى الفريق المدافع على خط مرماه، مواجهاً للمنفذ، بين القائمين، دون لمس قائمَي المرمى أو العارضة أو الشبكة. يجب أن يبقى بقدم واحدة على الأقل على خط المرمى أو فوقه حتى تُركل الكرة.',
  },
  {
    id: 'admin-4',
    type: 'admin',
    lawId: 12,
    articleId: '12.4',
    frontAr: 'ما هي معايير تحديد حرمان من فرصة واضحة لتسجيل هدف (DOGSO)؟',
    backAr: 'يُراعى: المسافة بين مكان المخالفة والمرمى، الاتجاه العام للعب، احتمالية الاحتفاظ بالكرة أو السيطرة عليها، موقع المدافعين وحركتهم.',
  },
  {
    id: 'admin-5',
    type: 'admin',
    lawId: 11,
    articleId: '11.3',
    frontAr: 'متى لا توجد مخالفة تسلل؟',
    backAr: 'لا توجد مخالفة تسلل إذا استلم اللاعب الكرة مباشرة من: ركلة مرمى، رمية تماس، ركلة ركنية.',
  },
]

export default function FlashcardsPage() {
  const router = useRouter()
  const { cards, setCards, updateCard } = useFlashcardsStore()
  const [isReviewing, setIsReviewing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 })

  // Initialize with sample cards if empty
  useEffect(() => {
    if (cards.length === 0) {
      const initialCards = sampleFlashcards.map(card => createFlashcard(card))
      setCards(initialCards)
    }
  }, [cards.length, setCards])

  const dueCards = getDueCards(cards)
  const stats = calculateStats(cards)
  const currentCard = dueCards[currentIndex]

  const handleStartReview = () => {
    if (dueCards.length > 0) {
      setIsReviewing(true)
      setCurrentIndex(0)
      setIsFlipped(false)
      setSessionStats({ reviewed: 0, correct: 0 })
    }
  }

  const handleRate = (rating: ReviewRating) => {
    if (!currentCard) return

    const updatedCard = updateFlashcardWithSM2(currentCard, rating)
    updateCard(updatedCard)

    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: rating >= 3 ? prev.correct + 1 : prev.correct,
    }))

    // Move to next card or end review
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
    } else {
      setIsReviewing(false)
    }
  }

  const getLawTitle = (lawId: number) => {
    const law = laws.find(l => l.id === lawId)
    return law?.titleAr.replace(/القانون [^ ]+ - /, '') || ''
  }

  // Review completed screen
  if (isReviewing && currentIndex >= dueCards.length) {
    return (
      <div className="px-4 py-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">أحسنت!</h2>
          <p className="text-gray-600 mb-6">
            لقد راجعت {toArabicNumerals(sessionStats.reviewed)} بطاقة
          </p>
          <div className="bg-white rounded-xl p-6 mb-6">
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {toArabicNumerals(sessionStats.correct)}
                </div>
                <div className="text-sm text-gray-500">صحيح</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {toArabicNumerals(sessionStats.reviewed - sessionStats.correct)}
                </div>
                <div className="text-sm text-gray-500">خطأ</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsReviewing(false)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium"
          >
            العودة
          </button>
        </div>
      </div>
    )
  }

  // Review screen
  if (isReviewing && currentCard) {
    return (
      <div className="px-4 py-6">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setIsReviewing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            إلغاء
          </button>
          <div className="text-sm text-gray-500">
            {toArabicNumerals(currentIndex + 1)} / {toArabicNumerals(dueCards.length)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-full mb-6">
          <div
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}
          />
        </div>

        {/* Card */}
        <div
          className="min-h-[300px] bg-white rounded-2xl shadow-lg p-6 mb-6 cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Law reference */}
          <div className="text-xs text-gray-500 mb-4">
            القانون {toArabicNumerals(currentCard.lawId)} - {getLawTitle(currentCard.lawId)}
          </div>

          {/* Content */}
          <div className="text-center py-8">
            {!isFlipped ? (
              <>
                <p className="text-lg font-medium text-gray-900 leading-relaxed arabic-text">
                  {currentCard.frontAr}
                </p>
                <p className="text-sm text-gray-400 mt-6">اضغط لرؤية الإجابة</p>
              </>
            ) : (
              <p className="text-base text-gray-700 leading-loose arabic-text">
                {currentCard.backAr}
              </p>
            )}
          </div>
        </div>

        {/* Rating buttons */}
        {isFlipped && (
          <div className="space-y-3">
            <p className="text-center text-sm text-gray-500 mb-2">كيف كانت إجابتك؟</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleRate(0)}
                className="py-3 px-4 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
              >
                لم أعرف
              </button>
              <button
                onClick={() => handleRate(3)}
                className="py-3 px-4 bg-yellow-100 text-yellow-700 rounded-xl font-medium hover:bg-yellow-200 transition-colors"
              >
                صعب
              </button>
              <button
                onClick={() => handleRate(4)}
                className="py-3 px-4 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors"
              >
                جيد
              </button>
              <button
                onClick={() => handleRate(5)}
                className="py-3 px-4 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
              >
                سهل
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Main flashcards screen
  return (
    <div className="px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">البطاقات التعليمية</h1>
        <p className="text-gray-500 text-sm">راجع القوانين بنظام التكرار المتباعد</p>
      </header>

      {/* Stats Overview */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {toArabicNumerals(stats.total)}
            </div>
            <div className="text-xs text-gray-500">الإجمالي</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {toArabicNumerals(stats.new)}
            </div>
            <div className="text-xs text-gray-500">جديد</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {toArabicNumerals(stats.learning)}
            </div>
            <div className="text-xs text-gray-500">قيد التعلم</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {toArabicNumerals(stats.mastered)}
            </div>
            <div className="text-xs text-gray-500">متقن</div>
          </div>
        </div>
      </div>

      {/* Due cards */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">للمراجعة اليوم</h3>
            <p className="text-primary-100 text-sm">
              {toArabicNumerals(dueCards.length)} بطاقة جاهزة
            </p>
          </div>
          <div className="text-4xl font-bold">
            {toArabicNumerals(dueCards.length)}
          </div>
        </div>
        <button
          onClick={handleStartReview}
          disabled={dueCards.length === 0}
          className={cn(
            'w-full py-3 rounded-xl font-medium transition-colors',
            dueCards.length > 0
              ? 'bg-white text-primary-600 hover:bg-primary-50'
              : 'bg-primary-400 text-primary-200 cursor-not-allowed'
          )}
        >
          {dueCards.length > 0 ? 'ابدأ المراجعة' : 'لا توجد بطاقات للمراجعة'}
        </button>
      </div>

      {/* Cards by law */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3">البطاقات حسب القانون</h3>
        <div className="space-y-2">
          {[11, 12, 14].map(lawId => {
            const lawCards = cards.filter(c => c.lawId === lawId)
            const lawDue = lawCards.filter(c => c.nextReview <= Date.now()).length
            return (
              <div
                key={lawId}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100"
              >
                <div>
                  <span className="font-medium text-gray-900">
                    القانون {toArabicNumerals(lawId)}
                  </span>
                  <span className="text-sm text-gray-500 mr-2">
                    ({toArabicNumerals(lawCards.length)} بطاقة)
                  </span>
                </div>
                {lawDue > 0 && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                    {toArabicNumerals(lawDue)} للمراجعة
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800">
          💡 <strong>نصيحة:</strong> يمكنك إنشاء بطاقات جديدة بالضغط مطولاً على أي نص في صفحة القوانين
        </p>
      </div>
    </div>
  )
}
