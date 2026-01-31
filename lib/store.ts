import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Law, Flashcard, SearchResult, QuickJump } from '@/types'
import { laws } from '@/data/laws-2025-26'
import { quickJumps } from '@/data/quick-jumps'

interface AppState {
  // Laws state
  laws: Law[]
  selectedLawId: number | null
  expandedArticles: Set<string>
  showHighFrequencyOnly: boolean

  // Search state
  searchQuery: string
  searchResults: SearchResult[]
  isSearching: boolean

  // UI state
  isOffline: boolean
  showInstallPrompt: boolean

  // Actions
  setSelectedLaw: (id: number | null) => void
  toggleArticle: (articleId: string) => void
  expandAllArticles: (lawId: number) => void
  collapseAllArticles: () => void
  setShowHighFrequencyOnly: (show: boolean) => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: SearchResult[]) => void
  setIsSearching: (searching: boolean) => void
  setIsOffline: (offline: boolean) => void
  setShowInstallPrompt: (show: boolean) => void
  getLawById: (id: number) => Law | undefined
  getQuickJumps: () => QuickJump[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      laws: laws,
      selectedLawId: null,
      expandedArticles: new Set<string>(),
      showHighFrequencyOnly: false,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      isOffline: false,
      showInstallPrompt: false,

      // Actions
      setSelectedLaw: (id) => set({ selectedLawId: id }),

      toggleArticle: (articleId) => {
        const expanded = new Set(get().expandedArticles)
        if (expanded.has(articleId)) {
          expanded.delete(articleId)
        } else {
          expanded.add(articleId)
        }
        set({ expandedArticles: expanded })
      },

      expandAllArticles: (lawId) => {
        const law = get().laws.find(l => l.id === lawId)
        if (!law) return
        const expanded = new Set(get().expandedArticles)
        law.articles.forEach(article => {
          expanded.add(article.id)
          article.subsections?.forEach(sub => expanded.add(sub.id))
        })
        set({ expandedArticles: expanded })
      },

      collapseAllArticles: () => set({ expandedArticles: new Set() }),

      setShowHighFrequencyOnly: (show) => set({ showHighFrequencyOnly: show }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSearchResults: (results) => set({ searchResults: results }),

      setIsSearching: (searching) => set({ isSearching: searching }),

      setIsOffline: (offline) => set({ isOffline: offline }),

      setShowInstallPrompt: (show) => set({ showInstallPrompt: show }),

      getLawById: (id) => get().laws.find(l => l.id === id),

      getQuickJumps: () => quickJumps,
    }),
    {
      name: 'referees-hub-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        showHighFrequencyOnly: state.showHighFrequencyOnly,
      }),
    }
  )
)

// Flashcards store (separate for better performance)
interface FlashcardsState {
  cards: Flashcard[]
  currentIndex: number
  isReviewing: boolean
  sessionStats: {
    reviewed: number
    correct: number
    incorrect: number
  }

  setCards: (cards: Flashcard[]) => void
  addCard: (card: Flashcard) => void
  updateCard: (card: Flashcard) => void
  deleteCard: (id: string) => void
  nextCard: () => void
  previousCard: () => void
  startReview: (cards: Flashcard[]) => void
  endReview: () => void
  recordReview: (correct: boolean) => void
  resetSession: () => void
}

export const useFlashcardsStore = create<FlashcardsState>((set, get) => ({
  cards: [],
  currentIndex: 0,
  isReviewing: false,
  sessionStats: {
    reviewed: 0,
    correct: 0,
    incorrect: 0,
  },

  setCards: (cards) => set({ cards }),

  addCard: (card) => set((state) => ({ cards: [...state.cards, card] })),

  updateCard: (card) => set((state) => ({
    cards: state.cards.map(c => c.id === card.id ? card : c),
  })),

  deleteCard: (id) => set((state) => ({
    cards: state.cards.filter(c => c.id !== id),
  })),

  nextCard: () => {
    const { currentIndex, cards } = get()
    if (currentIndex < cards.length - 1) {
      set({ currentIndex: currentIndex + 1 })
    }
  },

  previousCard: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 })
    }
  },

  startReview: (cards) => set({
    cards,
    currentIndex: 0,
    isReviewing: true,
    sessionStats: { reviewed: 0, correct: 0, incorrect: 0 },
  }),

  endReview: () => set({ isReviewing: false }),

  recordReview: (correct) => set((state) => ({
    sessionStats: {
      reviewed: state.sessionStats.reviewed + 1,
      correct: state.sessionStats.correct + (correct ? 1 : 0),
      incorrect: state.sessionStats.incorrect + (correct ? 0 : 1),
    },
  })),

  resetSession: () => set({
    currentIndex: 0,
    sessionStats: { reviewed: 0, correct: 0, incorrect: 0 },
  }),
}))
