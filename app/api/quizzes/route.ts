import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Quizzes are not available in demo mode — practice mode uses sample questions.
export async function GET() {
  return NextResponse.json({ quizzes: [] })
}
