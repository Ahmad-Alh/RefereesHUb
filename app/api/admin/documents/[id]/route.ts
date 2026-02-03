import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateDocumentSchema = z.object({
  titleAr: z.string().min(1, 'العنوان مطلوب').optional(),
  titleEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  fileUrl: z.string().url('رابط الملف غير صالح').optional(),
  fileName: z.string().optional(),
  fileSize: z.number().positive('حجم الملف غير صالح').optional(),
  fileType: z.string().optional(),
  category: z.enum(['IFAB_LAWS', 'TRAINING_MATERIALS', 'CIRCULARS', 'FORMS', 'OTHER']).optional(),
  isPublished: z.boolean().optional(),
})

// GET - Get single document
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            name: true,
            refereeNumber: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'المستند غير موجود' },
        { status: 404 }
      )
    }

    // Increment download count
    await prisma.document.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المستند' },
      { status: 500 }
    )
  }
}

// PATCH - Update document
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user ||
        (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') ||
        session.user.adminStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const validatedData = updateDocumentSchema.parse(body)

    const document = await prisma.document.update({
      where: { id },
      data: validatedData,
      include: {
        uploadedBy: {
          select: {
            name: true,
            refereeNumber: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'تم تحديث المستند بنجاح',
      document,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المستند' },
      { status: 500 }
    )
  }
}

// DELETE - Delete document
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user ||
        (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') ||
        session.user.adminStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      )
    }

    const { id } = await params

    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'تم حذف المستند بنجاح',
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المستند' },
      { status: 500 }
    )
  }
}
