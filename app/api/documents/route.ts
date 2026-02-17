import { NextResponse } from 'next/server'
import { getDocuments } from '@/lib/document-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(getDocuments())
}
