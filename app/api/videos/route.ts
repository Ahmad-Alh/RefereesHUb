import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const difficulty = searchParams.get('difficulty')
    const position = searchParams.get('position')
    const lawId = searchParams.get('lawId')
    const controversial = searchParams.get('controversial')

    const where: Record<string, unknown> = {
      isPublished: true,
    }

    if (difficulty) where.difficulty = difficulty
    if (position) where.position = position
    if (controversial === 'true') where.isControversial = true
    if (lawId) {
      where.laws = { some: { lawId: parseInt(lawId) } }
    }

    const videos = await prisma.video.findMany({
      where,
      include: { laws: { select: { lawId: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching videos:', error)
    // Return empty list so public UI still loads gracefully
    return NextResponse.json({ videos: [] })
  }
}

