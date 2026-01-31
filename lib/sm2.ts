/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo 2 algorithm used by Anki
 *
 * Rating scale:
 * 0 - Complete blackout, wrong response
 * 1 - Incorrect, but upon seeing correct answer, remembered
 * 2 - Incorrect, but correct answer seemed easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct after hesitation
 * 5 - Perfect response
 */

import type { Flashcard, ReviewRating } from '@/types'

export interface SM2Result {
  interval: number      // Days until next review
  repetition: number    // Number of successful reviews
  easeFactor: number    // Ease factor (minimum 1.3)
  nextReview: number    // Timestamp of next review
}

const MIN_EASE_FACTOR = 1.3
const DEFAULT_EASE_FACTOR = 2.5

export function calculateSM2(
  rating: ReviewRating,
  currentInterval: number,
  currentRepetition: number,
  currentEaseFactor: number
): SM2Result {
  let interval: number
  let repetition: number
  let easeFactor: number

  // If rating is less than 3, reset the card
  if (rating < 3) {
    repetition = 0
    interval = 1 // Review again tomorrow
    easeFactor = currentEaseFactor
  } else {
    // Successful recall
    if (currentRepetition === 0) {
      interval = 1
    } else if (currentRepetition === 1) {
      interval = 6
    } else {
      interval = Math.round(currentInterval * currentEaseFactor)
    }
    repetition = currentRepetition + 1

    // Calculate new ease factor
    easeFactor = currentEaseFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))

    // Ensure ease factor doesn't go below minimum
    if (easeFactor < MIN_EASE_FACTOR) {
      easeFactor = MIN_EASE_FACTOR
    }
  }

  // Calculate next review date
  const now = Date.now()
  const nextReview = now + (interval * 24 * 60 * 60 * 1000)

  return {
    interval,
    repetition,
    easeFactor,
    nextReview,
  }
}

// Apply SM2 result to a flashcard
export function updateFlashcardWithSM2(
  card: Flashcard,
  rating: ReviewRating
): Flashcard {
  const result = calculateSM2(
    rating,
    card.interval,
    card.repetition,
    card.easeFactor
  )

  return {
    ...card,
    interval: result.interval,
    repetition: result.repetition,
    easeFactor: result.easeFactor,
    nextReview: result.nextReview,
    lastReviewed: Date.now(),
  }
}

// Create a new flashcard with default SM2 values
export function createFlashcard(
  partial: Omit<Flashcard, 'interval' | 'repetition' | 'easeFactor' | 'nextReview' | 'createdAt'>
): Flashcard {
  return {
    ...partial,
    interval: 0,
    repetition: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    nextReview: Date.now(), // Due immediately
    createdAt: Date.now(),
  }
}

// Check if a card is due for review
export function isDue(card: Flashcard): boolean {
  return card.nextReview <= Date.now()
}

// Get cards due for review, sorted by urgency
export function getDueCards(cards: Flashcard[]): Flashcard[] {
  const now = Date.now()
  return cards
    .filter(card => card.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview)
}

// Get learning status of a card
export function getCardStatus(card: Flashcard): 'new' | 'learning' | 'review' | 'mastered' {
  if (card.repetition === 0) return 'new'
  if (card.interval < 21) return 'learning'
  if (card.interval >= 21 && card.easeFactor >= 2.5) return 'mastered'
  return 'review'
}

// Calculate study statistics
export function calculateStats(cards: Flashcard[]): {
  total: number
  new: number
  learning: number
  review: number
  mastered: number
  dueToday: number
  averageEase: number
} {
  const now = Date.now()
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  let newCount = 0
  let learningCount = 0
  let reviewCount = 0
  let masteredCount = 0
  let dueTodayCount = 0
  let totalEase = 0

  for (const card of cards) {
    const status = getCardStatus(card)
    if (status === 'new') newCount++
    else if (status === 'learning') learningCount++
    else if (status === 'review') reviewCount++
    else if (status === 'mastered') masteredCount++

    if (card.nextReview <= todayEnd.getTime()) {
      dueTodayCount++
    }
    totalEase += card.easeFactor
  }

  return {
    total: cards.length,
    new: newCount,
    learning: learningCount,
    review: reviewCount,
    mastered: masteredCount,
    dueToday: dueTodayCount,
    averageEase: cards.length > 0 ? totalEase / cards.length : DEFAULT_EASE_FACTOR,
  }
}
