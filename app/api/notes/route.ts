import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const hasEvaluator = searchParams.get('hasEvaluator')

    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (hasEvaluator !== null) {
      where.hasEvaluator = hasEvaluator === 'true'
    }

    const notes = await prisma.matchNote.findMany({
      where,
      orderBy: { matchDate: 'desc' },
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الملاحظات' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await req.json()
    const {
      matchDate,
      matchTime,
      matchName,
      hasEvaluator,
      evaluatorFeedback,
      personalNotes,
    } = body

    if (!matchDate || !matchName) {
      return NextResponse.json(
        { error: 'التاريخ واسم المباراة مطلوبان' },
        { status: 400 }
      )
    }

    const note = await prisma.matchNote.create({
      data: {
        userId: session.user.id,
        matchDate: new Date(matchDate),
        matchTime,
        matchName,
        hasEvaluator: hasEvaluator || false,
        evaluatorFeedback: hasEvaluator ? evaluatorFeedback : null,
        personalNotes,
      },
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الملاحظة' },
      { status: 500 }
    )
  }
}
