import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const count = await prisma.question.count({
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

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting practice questions:', error)
    return NextResponse.json(
      { error: 'فشل في جلب عدد الأسئلة' },
      { status: 500 }
    )
  }
}
