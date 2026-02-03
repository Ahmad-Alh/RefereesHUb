import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const documentSchema = z.object({
  titleAr: z.string().min(1, 'العنوان مطلوب'),
  titleEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  fileUrl: z.string().url('رابط الملف غير صالح'),
  fileName: z.string().min(1, 'اسم الملف مطلوب'),
  fileSize: z.number().positive('حجم الملف غير صالح'),
  fileType: z.string().min(1, 'نوع الملف مطلوب'),
  category: z.enum(['IFAB_LAWS', 'TRAINING_MATERIALS', 'CIRCULARS', 'FORMS', 'OTHER']),
  isPublished: z.boolean().default(true),
})

// GET - List all documents
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const isPublished = searchParams.get('isPublished')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const whereClause: Record<string, unknown> = {}

    if (category) {
      whereClause.category = category
    }

    if (isPublished !== null) {
      whereClause.isPublished = isPublished === 'true'
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: whereClause,
        include: {
          uploadedBy: {
            select: {
              name: true,
              refereeNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.document.count({ where: whereClause }),
    ])

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المستندات' },
      { status: 500 }
    )
  }
}

// POST - Create new document (admin only)
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const validatedData = documentSchema.parse(body)

    const document = await prisma.document.create({
      data: {
        ...validatedData,
        uploadedById: session.user.id,
      },
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
      message: 'تم إضافة المستند بنجاح',
      document,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة المستند' },
      { status: 500 }
    )
  }
}
