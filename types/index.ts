// IFAB Laws Data Types

export type Frequency = 'high' | 'medium' | 'low';

export interface Paragraph {
  id: string;
  textAr: string;
  textEn?: string;
}

export interface Subsection {
  id: string;
  titleAr: string;
  titleEn?: string;
  content: Paragraph[];
}

export interface Article {
  id: string;
  titleAr: string;
  titleEn?: string;
  content: Paragraph[];
  subsections?: Subsection[];
}

export interface Law {
  id: number;
  titleAr: string;
  titleEn: string;
  icon: string;
  frequency: Frequency;
  description?: string;
  articles: Article[];
}

// Flashcard Types

export type FlashcardType = 'user' | 'admin';

export interface Flashcard {
  id: string;
  type: FlashcardType;
  lawId: number;
  articleId: string;
  frontAr: string;
  backAr: string;
  sourceText?: string;

  // SM-2 Algorithm fields
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReview: number; // timestamp

  createdAt: number;
  lastReviewed?: number;
}

export type ReviewRating = 0 | 1 | 2 | 3 | 4 | 5;

// User Progress Types

export interface UserProgress {
  odId: string;
  lawId: number;
  articleId: string;
  readCount: number;
  lastRead: number;
  highlights: string[];
  bookmarked: boolean;
}

export interface Highlight {
  id: string;
  lawId: number;
  articleId: string;
  paragraphId: string;
  text: string;
  createdAt: number;
}

// Quick Jump Types

export interface QuickJump {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  lawId: number;
  articleId?: string;
  tags: string[];
}

// Search Types

export interface SearchResult {
  lawId: number;
  articleId: string;
  paragraphId: string;
  text: string;
  matchStart: number;
  matchEnd: number;
}

// Study Stats

export interface StudyStats {
  totalCards: number;
  mastered: number;
  learning: number;
  due: number;
  streak: number;
  lastStudyDate?: number;
}
