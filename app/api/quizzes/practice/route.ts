import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sampleQuestions } from '@/data/sample-questions'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const count = parseInt(searchParams.get('count') || '10')

    // Try to get questions from database first
    let questions: Array<{
      id: string
      questionTextAr: string
      questionType: string
      imageUrl?: string | null
      videoUrl?: string | null
      options: { id: string; textAr: string; orderIndex: number }[]
      lawId?: number | null
    }> = []

    try {
      const dbQuestions = await prisma.question.findMany({
        where: {
          quizQuestions: {
            some: {
              quiz: {
                isPractice: true,
              },
            },
          },
        },
        include: {
          options: {
            orderBy: { orderIndex: 'asc' },
          },
        },
        take: count * 3,
      })

      if (dbQuestions.length > 0) {
        questions = dbQuestions.map((q: { id: string; questionTextAr: string; questionType: string; imageUrl: string | null; videoUrl: string | null; options: { id: string; textAr: string; orderIndex: number }[]; lawId: number | null }) => ({
          id: q.id,
          questionTextAr: q.questionTextAr,
          questionType: q.questionType,
          imageUrl: q.imageUrl,
          videoUrl: q.videoUrl,
          options: q.options.map((opt: { id: string; textAr: string; orderIndex: number }) => ({
            id: opt.id,
            textAr: opt.textAr,
            orderIndex: opt.orderIndex,
          })),
          lawId: q.lawId,
        }))
      }
    } catch {
      // Database not available, will use sample questions
    }

    // Fallback to sample questions if database is empty or unavailable
    if (questions.length === 0) {
      questions = sampleQuestions.map((q) => ({
        id: q.id,
        questionTextAr: q.questionTextAr,
        questionType: q.questionType,
        options: q.options,
      }))
    }

    // Shuffle and take the requested count
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, count)

    return NextResponse.json({ questions: shuffled })
  } catch (error) {
    console.error('Error fetching practice questions:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الأسئلة' },
      { status: 500 }
    )
  }
}
