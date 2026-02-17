export interface Document {
  id: string
  titleAr: string
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
  mediaId?: string
}

declare global {
  // eslint-disable-next-line no-var
  var __documentStore: Map<string, Document> | undefined
}

function getStore(): Map<string, Document> {
  if (!global.__documentStore) {
    global.__documentStore = new Map()
  }
  return global.__documentStore
}

export function getDocuments(): Document[] {
  return Array.from(getStore().values()).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  )
}

export function addDocument(doc: Document): void {
  getStore().set(doc.id, doc)
}

export function deleteDocument(id: string): Document | null {
  const store = getStore()
  const doc = store.get(id) ?? null
  if (doc) store.delete(id)
  return doc
}
