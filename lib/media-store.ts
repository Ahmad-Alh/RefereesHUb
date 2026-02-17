export interface MediaFile {
  id: string
  fileName: string
  mimeType: string
  bytesBase64: string
  size: number
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

export function addMediaFile(input: {
  fileName: string
  mimeType: string
  buffer: Buffer
}): MediaFile {
  const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const media: MediaFile = {
    id,
    fileName: input.fileName,
    mimeType: input.mimeType,
    bytesBase64: input.buffer.toString('base64'),
    size: input.buffer.length,
    createdAt: new Date().toISOString(),
  }

  getStore().set(id, media)
  return media
}

export function getMediaFile(id: string): MediaFile | null {
  return getStore().get(id) ?? null
}

export function deleteMediaFile(id: string): boolean {
  return getStore().delete(id)
}
