export interface MediaFile {
  id: string
  fileName: string
  mimeType: string
  size: number
  bytesBase64: string
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
  const media: MediaFile = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    bytesBase64: Buffer.from(bytes).toString('base64'),
    createdAt: new Date().toISOString(),
  }

  getStore().set(media.id, media)
  return media
}

export function getMediaFile(id: string): MediaFile | null {
  return getStore().get(id) ?? null
}

export function deleteMediaFile(id: string): boolean {
  return getStore().delete(id)
}
