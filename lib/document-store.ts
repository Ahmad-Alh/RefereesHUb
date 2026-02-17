import fs from 'fs'
import path from 'path'

export interface Document {
  id: string
  titleAr: string
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedAt: string
}

const DATA_FILE = path.join(process.cwd(), 'data', 'documents.json')

function readDocuments(): Document[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return []
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeDocuments(docs: Document[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(docs, null, 2), 'utf-8')
}

export function getDocuments(): Document[] {
  return readDocuments()
}

export function addDocument(doc: Document): void {
  const docs = readDocuments()
  docs.push(doc)
  writeDocuments(docs)
}

export function deleteDocument(id: string): Document | null {
  const docs = readDocuments()
  const index = docs.findIndex((d) => d.id === id)
  if (index === -1) return null
  const [deleted] = docs.splice(index, 1)
  writeDocuments(docs)
  return deleted
}
