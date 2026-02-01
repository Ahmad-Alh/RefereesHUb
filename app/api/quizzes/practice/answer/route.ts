import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const { questionId, selectedAnswer } = body

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      return NextResponse.json({ error: 'السؤال غير موجود' }, { status: 404 })
    }

    const isCorrect = question.correctAnswer === selectedAnswer

    return NextResponse.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanationAr,
    })
  } catch (error) {
    console.error('Error checking answer:', error)
    return NextResponse.json(
      { error: 'فشل في التحقق من الإجابة' },
      { status: 500 }
    )
  }
}
