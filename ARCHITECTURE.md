# RefereesHub - Technical Architecture

## Overview
A mobile-first, offline-capable web app for UAE football referees to study the IFAB Laws of the Game 2025/26 (Arabic).

## Tech Stack Recommendation

### Frontend: Next.js 14 + React 18
**Why:**
- Static Site Generation (SSG) for fast loading
- Built-in PWA support via next-pwa
- Excellent Arabic/RTL support
- App Router for clean navigation

### Styling: Tailwind CSS
**Why:**
- RTL support via `dir="rtl"`
- Mobile-first utility classes
- Minimal bundle size
- No runtime CSS-in-JS overhead

### State Management: Zustand + IndexedDB
**Why:**
- Lightweight (1KB vs Redux 7KB)
- Works seamlessly with persistence
- IndexedDB for offline flashcard data

### Database: Local-first with IndexedDB (Dexie.js)
**Why:**
- Full offline capability
- Fast reads for law content
- Syncs when online (future)
- No server required for MVP

### Flashcard Algorithm: SM-2 (SuperMemo 2)
**Why:**
- Battle-tested spaced repetition
- Simple to implement
- Works offline
- Same algorithm Anki uses

## Architecture Decisions

### 1. Laws Content Storage
```
Option A: JSON files (CHOSEN)
- Laws stored as static JSON
- Versioned (2025-26, 2026-27, etc.)
- Fast initial load via SSG
- Easy to update

Option B: Database
- Overkill for read-only content
- Adds complexity
```

### 2. Offline Strategy
```
Service Worker + Cache API:
- Cache all law content on first visit
- Background sync for flashcard progress
- "Install as app" prompt

IndexedDB:
- User highlights
- Flashcard deck
- Study progress
- Bookmarks
```

### 3. Arabic Text Handling
```
- Font: Noto Naskh Arabic (optimized for screens)
- Direction: RTL globally
- Search: Arabic-aware tokenization
- Numbers: Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩)
```

## Data Schema

### Laws Structure
```typescript
interface Law {
  id: number;                    // 1-17
  titleAr: string;               // القانون الأول
  titleEn: string;               // Law 1
  icon: string;                  // emoji or icon name
  frequency: 'high' | 'medium' | 'low';  // 🔥 ⚠️ 📘
  articles: Article[];
}

interface Article {
  id: string;                    // "1.1", "12.2"
  titleAr: string;
  content: Paragraph[];
  subsections?: Subsection[];
}

interface Subsection {
  id: string;                    // "12.1.1"
  titleAr: string;
  content: Paragraph[];
}

interface Paragraph {
  id: string;
  textAr: string;               // VERBATIM IFAB text
  isHighlighted?: boolean;
}
```

### Flashcard Schema
```typescript
interface Flashcard {
  id: string;
  type: 'user' | 'admin';
  lawId: number;
  articleId: string;
  frontAr: string;              // Question
  backAr: string;               // Answer (verbatim IFAB)
  sourceText: string;           // Original highlighted text

  // SM-2 Algorithm fields
  interval: number;             // Days until next review
  repetition: number;           // Times reviewed
  easeFactor: number;           // 2.5 default, adjusts per performance
  nextReview: Date;

  createdAt: Date;
  lastReviewed?: Date;
}

interface UserProgress {
  odId: string;
  lawId: number;
  articleId: string;
  readCount: number;
  lastRead: Date;
  highlights: string[];         // Paragraph IDs
  bookmarked: boolean;
}
```

## File Structure
```
/app
  /(main)
    /page.tsx                   # Home - 17 laws grid
    /law/[id]/page.tsx          # Law detail with accordion
    /search/page.tsx            # Search + quick jump
    /flashcards/page.tsx        # Review interface
    /flashcards/create/page.tsx # Create from highlight
  /(admin)
    /admin/page.tsx             # Admin dashboard
  /layout.tsx                   # RTL, Arabic font
  /manifest.json                # PWA manifest

/components
  /laws
    /LawCard.tsx                # Grid card component
    /LawAccordion.tsx           # Expandable sections
    /ArticleSection.tsx         # Article with paragraphs
    /HighlightableText.tsx      # Text selection + highlight
  /flashcards
    /FlashcardDeck.tsx          # Swipeable cards
    /ReviewCard.tsx             # Single card UI
    /ProgressRing.tsx           # Mastery indicator
  /search
    /SearchBar.tsx              # Arabic search input
    /QuickJumpGrid.tsx          # Common situations
  /ui
    /BottomNav.tsx              # Mobile navigation
    /Badge.tsx                  # Frequency badges

/data
  /laws-2025-26.json            # All 17 laws verbatim
  /quick-jumps.json             # Situation shortcuts
  /admin-flashcards.json        # Pre-generated cards

/lib
  /db.ts                        # Dexie IndexedDB setup
  /sm2.ts                       # Spaced repetition algorithm
  /search.ts                    # Arabic search utilities
  /store.ts                     # Zustand store

/public
  /fonts                        # Noto Naskh Arabic
  /icons                        # PWA icons
```

## Law Frequency Classification

Based on typical match scenarios:

### 🔥 High Frequency (Every match)
- Law 11: Offside
- Law 12: Fouls and Misconduct
- Law 13: Free Kicks
- Law 14: Penalty Kick
- Law 5: The Referee

### ⚠️ Medium Frequency (Most matches)
- Law 15: Throw-In
- Law 16: Goal Kick
- Law 17: Corner Kick
- Law 8: Start and Restart
- Law 10: Determining Outcome

### 📘 Low Frequency (Rarely referenced during play)
- Law 1: Field of Play
- Law 2: The Ball
- Law 3: The Players
- Law 4: Players' Equipment
- Law 6: Other Match Officials
- Law 7: Duration of Match
- Law 9: Ball In/Out of Play

## Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Offline ready: < 5s after first visit
- Bundle size: < 100KB gzipped (excluding fonts)

## Future Considerations
- Cloud sync for multi-device
- Video library integration
- Quiz mode with scoring
- Community flashcard sharing
- Push notifications for daily review
