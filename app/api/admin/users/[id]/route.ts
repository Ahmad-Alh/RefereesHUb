import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Update admin status (approve/reject)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح - يتطلب صلاحية المالك' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { adminStatus } = body

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(adminStatus)) {
      return NextResponse.json(
        { error: 'حالة غير صالحة' },
        { status: 400 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Cannot modify SUPER_ADMIN
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'لا يمكن تعديل حساب المالك' },
        { status: 403 }
      )
    }

    // Update the admin status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { adminStatus },
      select: {
        id: true,
        name: true,
        email: true,
        adminStatus: true,
      },
    })

    return NextResponse.json({
      message: adminStatus === 'APPROVED'
        ? 'تمت الموافقة على المشرف بنجاح'
        : adminStatus === 'REJECTED'
        ? 'تم رفض طلب المشرف'
        : 'تم تعليق حساب المشرف',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating admin status:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث حالة المشرف' },
      { status: 500 }
    )
  }
}

// Delete admin user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح - يتطلب صلاحية المالك' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // Cannot delete SUPER_ADMIN
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'لا يمكن حذف حساب المالك' },
        { status: 403 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'تم حذف حساب المشرف بنجاح',
    })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المشرف' },
      { status: 500 }
    )
  }
}
