import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'


// Questions management is not available in demo mode (no DB).
// Returns empty list for admin so the UI doesn't crash.
export async function GET() {
  return NextResponse.json({
    questions: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  })
}

export async function POST() {
  return NextResponse.json(
    { error: 'إدارة الأسئلة غير متاحة في وضع العرض التجريبي' },
    { status: 503 }
  )
}
