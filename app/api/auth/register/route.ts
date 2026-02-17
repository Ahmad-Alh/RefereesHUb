import { NextResponse } from 'next/server'

// Public registration is disabled in this system.
// There are no user accounts — only a single admin account.
export async function POST() {
  return NextResponse.json({ error: 'التسجيل غير متاح' }, { status: 403 })
}
