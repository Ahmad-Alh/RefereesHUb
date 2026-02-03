import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Get all admin users (for SUPER_ADMIN only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح - يتطلب صلاحية المالك' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // PENDING, APPROVED, REJECTED, or null for all

    const whereClause: Record<string, unknown> = {
      role: { in: ['ADMIN', 'SUPER_ADMIN'] },
    }

    if (status) {
      whereClause.adminStatus = status
    }

    const admins = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        refereeNumber: true,
        name: true,
        email: true,
        role: true,
        adminStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Count by status
    const counts = await prisma.user.groupBy({
      by: ['adminStatus'],
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      _count: true,
    })

    const statusCounts = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
    }

    counts.forEach((c) => {
      if (c.adminStatus) {
        statusCounts[c.adminStatus as keyof typeof statusCounts] = c._count
      }
    })

    return NextResponse.json({
      admins,
      counts: statusCounts,
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المشرفين' },
      { status: 500 }
    )
  }
}
