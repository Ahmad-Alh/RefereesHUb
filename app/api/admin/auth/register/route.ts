import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const adminRegisterSchema = z.object({
  refereeNumber: z
    .string()
    .min(1, 'رقم الحكم مطلوب')
    .max(4, 'رقم الحكم يجب أن يكون من 1 إلى 4 أرقام')
    .regex(/^\d+$/, 'رقم الحكم يجب أن يحتوي على أرقام فقط'),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = adminRegisterSchema.parse(body)

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Check if referee number already exists
    const existingReferee = await prisma.user.findUnique({
      where: { refereeNumber: validatedData.refereeNumber },
    })

    if (existingReferee) {
      return NextResponse.json(
        { error: 'رقم الحكم مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Hash password and create admin user with PENDING status
    const hashedPassword = await hash(validatedData.password, 12)

    const user = await prisma.user.create({
      data: {
        refereeNumber: validatedData.refereeNumber,
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'ADMIN',
        adminStatus: 'PENDING',
      },
    })

    return NextResponse.json({
      message: 'تم إرسال طلب التسجيل بنجاح. يرجى انتظار موافقة المسؤول.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        refereeNumber: user.refereeNumber,
        adminStatus: user.adminStatus,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Admin registration error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الطلب' },
      { status: 500 }
    )
  }
}
