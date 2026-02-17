import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Notes require a user account — not available in demo/mockup mode.
// Return empty list for GET, 403 for POST.
export async function GET() {
  return NextResponse.json({ notes: [] })
}

export async function POST() {
  return NextResponse.json(
    { error: 'الملاحظات غير متاحة في وضع العرض التجريبي' },
    { status: 403 }
  )
}
