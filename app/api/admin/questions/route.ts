import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function forbidden() {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
}

// Questions management is not available in demo mode (no DB).
// Returns empty list for admin so the UI doesn't crash.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return forbidden()

  return NextResponse.json({
    questions: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  })
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return forbidden()

  return NextResponse.json(
    { error: 'إدارة الأسئلة غير متاحة في وضع العرض التجريبي' },
    { status: 503 }
  )
}
