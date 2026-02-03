import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user ||
        (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') ||
        session.user.adminStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const lawId = searchParams.get('lawId')

    const where: Record<string, unknown> = {}

    if (type) {
      where.questionType = type
    }

    if (lawId) {
      where.lawId = parseInt(lawId)
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          options: {
            orderBy: { orderIndex: 'asc' },
          },
          _count: {
            select: { userAnswers: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.question.count({ where }),
    ])

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الأسئلة' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user ||
        (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') ||
        session.user.adminStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const {
      questionTextAr,
      questionTextEn,
      questionType,
      imageUrl,
      videoUrl,
      correctAnswer,
      lawId,
      articleId,
      explanationAr,
      explanationEn,
      options,
      addToPractice,
    } = body

    // Validate required fields
    if (!questionTextAr || !questionType) {
      return NextResponse.json(
        { error: 'نص السؤال ونوع السؤال مطلوبان' },
        { status: 400 }
      )
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        questionTextAr,
        questionTextEn,
        questionType,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        correctAnswer,
        lawId: lawId || null,
        articleId: articleId || null,
        explanationAr: explanationAr || null,
        explanationEn: explanationEn || null,
        isAIGenerated: false,
        options: {
          create: options?.map((opt: { textAr: string; textEn?: string }, index: number) => ({
            textAr: opt.textAr,
            textEn: opt.textEn,
            orderIndex: index,
          })) || [],
        },
      },
      include: {
        options: true,
      },
    })

    // Add to practice quiz if requested
    if (addToPractice) {
      // Find or create practice quiz
      let practiceQuiz = await prisma.quiz.findFirst({
        where: { isPractice: true },
      })

      if (!practiceQuiz) {
        practiceQuiz = await prisma.quiz.create({
          data: {
            titleAr: 'بنك التدريب',
            titleEn: 'Practice Bank',
            isPractice: true,
            isPublished: true,
          },
        })
      }

      await prisma.quizQuestion.create({
        data: {
          quizId: practiceQuiz.id,
          questionId: question.id,
          orderIndex: 0,
        },
      })
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء السؤال' },
      { status: 500 }
    )
  }
}
