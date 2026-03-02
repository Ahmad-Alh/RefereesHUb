import { promises as fs } from 'fs'
import path from 'path'

export interface MediaFile {
  id: string
  fileName: string
  mimeType: string
  size: number
  filePath: string
  kind: 'video' | 'document' | 'other'
  createdAt: string
}

declare global {
  // eslint-disable-next-line no-var
  var __mediaStore: Map<string, MediaFile> | undefined
}

function getStore(): Map<string, MediaFile> {
  if (!global.__mediaStore) {
    global.__mediaStore = new Map()
  }
  return global.__mediaStore
}

export async function addMediaFile(file: File): Promise<MediaFile> {
  const bytes = await file.arrayBuffer()
  const ext = path.extname(file.name) || ''
  const mimeType = file.type || 'application/octet-stream'
  const kind: MediaFile['kind'] = mimeType.startsWith('video/')
    ? 'video'
    : mimeType === 'application/pdf' || ext.toLowerCase() === '.pdf'
      ? 'document'
      : 'other'
  const dir = path.join(process.cwd(), 'uploads', kind)
  await fs.mkdir(dir, { recursive: true })

  const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const storedName = `${id}${ext}`
  const absolutePath = path.join(dir, storedName)
  await fs.writeFile(absolutePath, Buffer.from(bytes))

  const media: MediaFile = {
    id,
    fileName: file.name,
    mimeType,
    size: file.size,
    filePath: absolutePath,
    kind,
    createdAt: new Date().toISOString(),
  }

  getStore().set(media.id, media)
  return media
}

export function getMediaFile(id: string): MediaFile | null {
  return getStore().get(id) ?? null
}

export function deleteMediaFile(id: string): boolean {
  const store = getStore()
  const media = store.get(id)
  if (!media) return false

  void fs.unlink(media.filePath).catch(() => null)
  return store.delete(id)
}
