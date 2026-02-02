import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sampleQuestions } from '@/data/sample-questions'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let count = 0

    try {
      count = await prisma.question.count({
        where: {
          quizQuestions: {
            some: {
              quiz: {
                isPractice: true,
              },
            },
          },
        },
      })
    } catch {
      // Database not available
    }

    // Fallback to sample questions count
    if (count === 0) {
      count = sampleQuestions.length
    }

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting practice questions:', error)
    return NextResponse.json(
      { error: 'فشل في جلب عدد الأسئلة' },
      { status: 500 }
    )
  }
}
