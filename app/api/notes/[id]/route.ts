import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Notes are not available in demo/mockup mode (no DB).
export async function GET() {
  return NextResponse.json({ error: 'غير متاح' }, { status: 404 })
}
export async function PUT() {
  return NextResponse.json({ error: 'غير متاح' }, { status: 403 })
}
export async function DELETE() {
  return NextResponse.json({ error: 'غير متاح' }, { status: 403 })
}
