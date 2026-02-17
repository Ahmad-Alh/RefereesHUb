import { NextRequest, NextResponse } from 'next/server'
import { getPublishedVideos } from '@/lib/video-store'

export const dynamic = 'force-dynamic'

// Public: list published videos with optional filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const difficulty = searchParams.get('difficulty')
  const position = searchParams.get('position')
  const lawId = searchParams.get('lawId') ? parseInt(searchParams.get('lawId')!) : null
  const controversial = searchParams.get('controversial') === 'true'

  let videos = getPublishedVideos()

  if (difficulty) videos = videos.filter((v) => v.difficulty === difficulty)
  if (position) videos = videos.filter((v) => v.position === position)
  if (controversial) videos = videos.filter((v) => v.isControversial)
  if (lawId) videos = videos.filter((v) => v.laws.some((l) => l.lawId === lawId))

  return NextResponse.json({ videos })
}
