// ─────────────────────────────────────────────────────────────────────────────
// In-memory video store for demo/mockup mode (no database required).
// Starts empty — admin adds videos via the dashboard.
// Admin additions persist for the lifetime of the server process.
// On cold-start / redeploy → resets to empty (fine for demo).
// ─────────────────────────────────────────────────────────────────────────────

export interface VideoItem {
  id: string
  titleAr: string
  titleEn: string | null
  descriptionAr: string | null   // optional — admin may leave blank
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

// Empty by default — admin populates via the dashboard
const INITIAL_VIDEOS: VideoItem[] = []

// ─────────────────────────────────────────────────────────────────────────────
// Singleton store — persists across requests in the same Node.js process
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __videoStore: Map<string, VideoItem> | undefined
}

function getStore(): Map<string, VideoItem> {
  if (!global.__videoStore) {
    global.__videoStore = new Map(INITIAL_VIDEOS.map((v) => [v.id, v]))
  }
  return global.__videoStore
}

export function getAllVideos(): VideoItem[] {
  return Array.from(getStore().values()).sort(
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
