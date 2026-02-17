import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// No database setup needed in demo mode.
// Admin credentials are set via ADMIN_EMAIL / ADMIN_PASSWORD environment variables.
export async function GET() {
  return NextResponse.json({
    setupRequired: false,
    message: 'وضع العرض التجريبي — المسؤول يتم تحديده عبر متغيرات البيئة',
    loginAt: '/admin',
  })
}

export async function POST() {
  return NextResponse.json(
    { error: 'استخدم متغيرات البيئة ADMIN_EMAIL و ADMIN_PASSWORD لتعيين بيانات المسؤول' },
    { status: 410 }
  )
}
