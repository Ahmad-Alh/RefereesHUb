import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const count = parseInt(searchParams.get('count') || '10')

    // Get random questions from practice quizzes
    const questions = await prisma.question.findMany({
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
      take: count * 3, // Get more than needed for randomization
    })

    // Shuffle and take the requested count
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, count)

    const formattedQuestions = shuffled.map((q: { id: string; questionTextAr: string; questionType: string; imageUrl: string | null; videoUrl: string | null; options: { id: string; textAr: string; orderIndex: number }[]; lawId: number | null }) => ({
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

    return NextResponse.json({ questions: formattedQuestions })
  } catch (error) {
    console.error('Error fetching practice questions:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الأسئلة' },
      { status: 500 }
    )
  }
}
