import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params

    const note = await prisma.matchNote.findUnique({
      where: { id, userId: session.user.id },
    })

    if (!note) {
      return NextResponse.json({ error: 'الملاحظة غير موجودة' }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الملاحظة' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Verify ownership
    const existingNote = await prisma.matchNote.findUnique({
      where: { id },
    })

    if (!existingNote || existingNote.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const note = await prisma.matchNote.update({
      where: { id },
      data: {
        matchDate: body.matchDate ? new Date(body.matchDate) : undefined,
        matchTime: body.matchTime,
        matchName: body.matchName,
        hasEvaluator: body.hasEvaluator,
        evaluatorFeedback: body.hasEvaluator ? body.evaluatorFeedback : null,
        personalNotes: body.personalNotes,
      },
    })

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { error: 'فشل في تحديث الملاحظة' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existingNote = await prisma.matchNote.findUnique({
      where: { id },
    })

    if (!existingNote || existingNote.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    await prisma.matchNote.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'فشل في حذف الملاحظة' },
      { status: 500 }
    )
  }
}
