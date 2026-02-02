import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sampleQuestions } from '@/data/sample-questions'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { questionId, selectedAnswer } = body

    // Try to find in database first
    let correctAnswer: number | null = null
    let explanation: string | null = null

    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      })

      if (question) {
        correctAnswer = question.correctAnswer
        explanation = question.explanationAr
      }
    } catch {
      // Database not available
    }

    // Fallback to sample questions
    if (correctAnswer === null) {
      const sampleQuestion = sampleQuestions.find((q) => q.id === questionId)
      if (sampleQuestion) {
        correctAnswer = sampleQuestion.correctAnswer
        explanation = sampleQuestion.explanationAr
      }
    }

    if (correctAnswer === null) {
      return NextResponse.json({ error: 'السؤال غير موجود' }, { status: 404 })
    }

    const isCorrect = correctAnswer === selectedAnswer

    return NextResponse.json({
      isCorrect,
      correctAnswer,
      explanation,
    })
  } catch (error) {
    console.error('Error checking answer:', error)
    return NextResponse.json(
      { error: 'فشل في التحقق من الإجابة' },
      { status: 500 }
    )
  }
}
