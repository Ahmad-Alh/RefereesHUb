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

    const quizzes = await prisma.quiz.findMany({
      where: {
        isPublished: true,
        isPractice: false,
      },
      include: {
        _count: {
          select: { questions: true },
        },
        attempts: {
          where: { userId: session.user.id },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { publishedAt: 'desc' },
    })

    const formattedQuizzes = quizzes.map((quiz) => ({
      id: quiz.id,
      titleAr: quiz.titleAr,
      descriptionAr: quiz.descriptionAr,
      questionCount: quiz._count.questions,
      publishedAt: quiz.publishedAt?.toISOString(),
      userAttempt:
        quiz.attempts.length > 0 && quiz.attempts[0].completedAt
          ? {
              score: quiz.attempts[0].score,
              completedAt: quiz.attempts[0].completedAt.toISOString(),
            }
          : null,
    }))

    return NextResponse.json({ quizzes: formattedQuizzes })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الاختبارات' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const { titleAr, titleEn, descriptionAr, descriptionEn, questionIds, isPractice } = body

    const quiz = await prisma.quiz.create({
      data: {
        titleAr,
        titleEn,
        descriptionAr,
        descriptionEn,
        isPractice: isPractice || false,
        createdById: session.user.id,
        questions: {
          create: questionIds?.map((questionId: string, index: number) => ({
            questionId,
            orderIndex: index,
          })) || [],
        },
      },
    })

    return NextResponse.json({ quiz })
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الاختبار' },
      { status: 500 }
    )
  }
}
