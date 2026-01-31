import Dexie, { type Table } from 'dexie'
import type { Flashcard, Highlight, UserProgress } from '@/types'

export class RefereesHubDB extends Dexie {
  flashcards!: Table<Flashcard, string>
  highlights!: Table<Highlight, string>
  progress!: Table<UserProgress, string>

  constructor() {
    super('RefereesHubDB')

    this.version(1).stores({
      flashcards: 'id, type, lawId, articleId, nextReview, createdAt',
      highlights: 'id, lawId, articleId, paragraphId, createdAt',
      progress: 'odId, lawId, articleId, lastRead',
    })
  }
}

export const db = new RefereesHubDB()

// Flashcard operations
export async function addFlashcard(flashcard: Flashcard): Promise<string> {
  return await db.flashcards.add(flashcard)
}

export async function updateFlashcard(flashcard: Flashcard): Promise<void> {
  await db.flashcards.put(flashcard)
}

export async function deleteFlashcard(id: string): Promise<void> {
  await db.flashcards.delete(id)
}

export async function getFlashcard(id: string): Promise<Flashcard | undefined> {
  return await db.flashcards.get(id)
}

export async function getAllFlashcards(): Promise<Flashcard[]> {
  return await db.flashcards.toArray()
}

export async function getFlashcardsByLaw(lawId: number): Promise<Flashcard[]> {
  return await db.flashcards.where('lawId').equals(lawId).toArray()
}

export async function getDueFlashcards(): Promise<Flashcard[]> {
  const now = Date.now()
  return await db.flashcards.where('nextReview').belowOrEqual(now).toArray()
}

export async function getFlashcardsByType(type: 'user' | 'admin'): Promise<Flashcard[]> {
  return await db.flashcards.where('type').equals(type).toArray()
}

// Highlight operations
export async function addHighlight(highlight: Highlight): Promise<string> {
  return await db.highlights.add(highlight)
}

export async function deleteHighlight(id: string): Promise<void> {
  await db.highlights.delete(id)
}

export async function getHighlightsByLaw(lawId: number): Promise<Highlight[]> {
  return await db.highlights.where('lawId').equals(lawId).toArray()
}

export async function getHighlightsByArticle(lawId: number, articleId: string): Promise<Highlight[]> {
  return await db.highlights
    .where(['lawId', 'articleId'])
    .equals([lawId, articleId])
    .toArray()
}

export async function getAllHighlights(): Promise<Highlight[]> {
  return await db.highlights.toArray()
}

// Progress operations
export async function updateProgress(progress: UserProgress): Promise<void> {
  await db.progress.put(progress)
}

export async function getProgress(lawId: number, articleId: string): Promise<UserProgress | undefined> {
  return await db.progress
    .where(['lawId', 'articleId'])
    .equals([lawId, articleId])
    .first()
}

export async function getAllProgress(): Promise<UserProgress[]> {
  return await db.progress.toArray()
}

export async function getBookmarkedArticles(): Promise<UserProgress[]> {
  return await db.progress.filter(p => p.bookmarked).toArray()
}

// Utility: Clear all data (for testing)
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.flashcards.clear(),
    db.highlights.clear(),
    db.progress.clear(),
  ])
}

// Utility: Export all data
export async function exportData(): Promise<{
  flashcards: Flashcard[]
  highlights: Highlight[]
  progress: UserProgress[]
}> {
  const [flashcards, highlights, progress] = await Promise.all([
    db.flashcards.toArray(),
    db.highlights.toArray(),
    db.progress.toArray(),
  ])
  return { flashcards, highlights, progress }
}

// Utility: Import data
export async function importData(data: {
  flashcards?: Flashcard[]
  highlights?: Highlight[]
  progress?: UserProgress[]
}): Promise<void> {
  if (data.flashcards) {
    await db.flashcards.bulkPut(data.flashcards)
  }
  if (data.highlights) {
    await db.highlights.bulkPut(data.highlights)
  }
  if (data.progress) {
    await db.progress.bulkPut(data.progress)
  }
}
