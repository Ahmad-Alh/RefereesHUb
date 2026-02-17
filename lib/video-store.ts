// ─────────────────────────────────────────────────────────────────────────────
// In-memory video store for demo/mockup mode (no database required).
// Pre-loaded with sample football officiating videos.
// Admin additions persist for the lifetime of the server process.
// On cold-start / redeploy → resets to SAMPLE_VIDEOS (fine for demo).
// ─────────────────────────────────────────────────────────────────────────────

export interface VideoItem {
  id: string
  titleAr: string
  titleEn: string | null
  descriptionAr: string | null
  url: string
  thumbnailUrl: string | null
  difficulty: string
  position: string
  isControversial: boolean
  isPublished: boolean
  tags: string[]
  laws: { lawId: number }[]
  createdAt: string
  updatedAt: string
}

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: 'demo-v1',
    titleAr: 'قانون التسلل - فهم مواقف التسلل',
    titleEn: 'Offside Law - Understanding Offside Situations',
    descriptionAr:
      'شرح تفصيلي لقانون ١١ (التسلل) مع أمثلة واضحة من المباريات الرسمية. يشمل التسلل النشط والتسلل غير المؤثر.',
    url: 'https://www.youtube.com/watch?v=VMYFuq0JgOU',
    thumbnailUrl: 'https://img.youtube.com/vi/VMYFuq0JgOU/hqdefault.jpg',
    difficulty: 'BEGINNER',
    position: 'ALL',
    isControversial: false,
    isPublished: true,
    tags: ['offside'],
    laws: [{ lawId: 11 }],
    createdAt: new Date('2025-01-10').toISOString(),
    updatedAt: new Date('2025-01-10').toISOString(),
  },
  {
    id: 'demo-v2',
    titleAr: 'لمسة اليد - تطبيق قانون ١٢',
    titleEn: 'Handball - Applying Law 12',
    descriptionAr:
      'توضيح لموقف لمسة اليد القصدية وغير القصدية وفق قوانين الفيفا 2025/26. يشمل الذراع والكتف والإيماءة الطبيعية.',
    url: 'https://www.youtube.com/watch?v=4fHBbWMfuTI',
    thumbnailUrl: 'https://img.youtube.com/vi/4fHBbWMfuTI/hqdefault.jpg',
    difficulty: 'INTERMEDIATE',
    position: 'CENTER_REF',
    isControversial: true,
    isPublished: true,
    tags: ['handball'],
    laws: [{ lawId: 12 }],
    createdAt: new Date('2025-01-12').toISOString(),
    updatedAt: new Date('2025-01-12').toISOString(),
  },
  {
    id: 'demo-v3',
    titleAr: 'إيقاف فرصة محققة - DOGSO',
    titleEn: 'Denying Obvious Goal-Scoring Opportunity',
    descriptionAr:
      'شرح معايير DOGSO الأربعة: المسافة من المرمى، اتجاه الهجوم، موقع المدافعين، السيطرة على الكرة. متى يكون الطرد واجباً؟',
    url: 'https://www.youtube.com/watch?v=OAoMOmat24c',
    thumbnailUrl: 'https://img.youtube.com/vi/OAoMOmat24c/hqdefault.jpg',
    difficulty: 'ADVANCED',
    position: 'CENTER_REF',
    isControversial: false,
    isPublished: true,
    tags: ['DOGSO'],
    laws: [{ lawId: 12 }],
    createdAt: new Date('2025-01-15').toISOString(),
    updatedAt: new Date('2025-01-15').toISOString(),
  },
  {
    id: 'demo-v4',
    titleAr: 'الحكم المساعد - تحركات خط التسلل',
    titleEn: 'Assistant Referee - Offside Line Movements',
    descriptionAr:
      'تدريب للحكام المساعدين على تحركات خط التسلل، الإشارة الصحيحة، والتنسيق مع الحكم الرئيسي.',
    url: 'https://www.youtube.com/watch?v=kqwB_3s7tLU',
    thumbnailUrl: 'https://img.youtube.com/vi/kqwB_3s7tLU/hqdefault.jpg',
    difficulty: 'INTERMEDIATE',
    position: 'ASSISTANT_REF',
    isControversial: false,
    isPublished: true,
    tags: ['AR', 'offside'],
    laws: [{ lawId: 6 }, { lawId: 11 }],
    createdAt: new Date('2025-01-18').toISOString(),
    updatedAt: new Date('2025-01-18').toISOString(),
  },
  {
    id: 'demo-v5',
    titleAr: 'قانون ١٢ - التدخلات الجسدية والمخالفات',
    titleEn: 'Law 12 - Fouls and Misconduct',
    descriptionAr:
      'مراجعة شاملة لأنواع المخالفات الجسدية: التدخل من الخلف، العرقلة، الإمساك، الدفع. درجة الخطورة والعقوبة المناسبة.',
    url: 'https://www.youtube.com/watch?v=lDKCSheBc-8',
    thumbnailUrl: 'https://img.youtube.com/vi/lDKCSheBc-8/hqdefault.jpg',
    difficulty: 'BEGINNER',
    position: 'CENTER_REF',
    isControversial: false,
    isPublished: false,
    tags: ['foul'],
    laws: [{ lawId: 12 }],
    createdAt: new Date('2025-01-20').toISOString(),
    updatedAt: new Date('2025-01-20').toISOString(),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Singleton store — persists across requests in the same Node.js process
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __videoStore: Map<string, VideoItem> | undefined
}

function getStore(): Map<string, VideoItem> {
  if (!global.__videoStore) {
    global.__videoStore = new Map(SAMPLE_VIDEOS.map((v) => [v.id, v]))
  }
  return global.__videoStore
}

export function getAllVideos(): VideoItem[] {
  return [...getStore().values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getPublishedVideos(): VideoItem[] {
  return getAllVideos().filter((v) => v.isPublished)
}

export function getVideoById(id: string): VideoItem | null {
  return getStore().get(id) ?? null
}

export function createVideo(
  data: Omit<VideoItem, 'id' | 'createdAt' | 'updatedAt'>
): VideoItem {
  const now = new Date().toISOString()
  const video: VideoItem = {
    ...data,
    id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  }
  getStore().set(video.id, video)
  return video
}

export function updateVideo(
  id: string,
  data: Partial<Omit<VideoItem, 'id' | 'createdAt'>>
): VideoItem | null {
  const store = getStore()
  const existing = store.get(id)
  if (!existing) return null
  const updated: VideoItem = {
    ...existing,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  store.set(id, updated)
  return updated
}

export function deleteVideo(id: string): boolean {
  return getStore().delete(id)
}

export function getStats() {
  const all = getAllVideos()
  return {
    total: all.length,
    published: all.filter((v) => v.isPublished).length,
    drafts: all.filter((v) => !v.isPublished).length,
  }
}
