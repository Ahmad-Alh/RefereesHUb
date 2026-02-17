import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// One-time setup endpoint.
// Creates the first admin account ONLY if no admin exists yet.
// After an admin exists, this endpoint returns 403 permanently.
// Use: POST /api/setup  { "email": "...", "password": "...", "name": "...", "secret": "..." }
// The "secret" must match SETUP_SECRET env var (or "setup-referees-hub" by default).

export async function POST(req: NextRequest) {
  try {
    // Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'التهيئة مكتملة — يوجد مسؤول مسجل بالفعل' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { email, password, name, secret } = body

    // Validate setup secret
    const setupSecret = process.env.SETUP_SECRET || 'setup-referees-hub'
    if (secret !== setupSecret) {
      return NextResponse.json({ error: 'رمز التهيئة غير صحيح' }, { status: 403 })
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور والاسم مطلوبة' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)

    const admin = await prisma.user.create({
      data: {
        refereeNumber: '0000',
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء حساب المسؤول بنجاح',
      email: admin.email,
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'فشل في إنشاء الحساب' }, { status: 500 })
  }
}

// GET: Check if setup is needed
export async function GET() {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    return NextResponse.json({
      setupRequired: !adminExists,
      message: adminExists
        ? 'النظام جاهز — يوجد مسؤول مسجل'
        : 'التهيئة مطلوبة — لا يوجد مسؤول بعد',
    })
  } catch (error) {
    return NextResponse.json({ error: 'فشل في التحقق' }, { status: 500 })
  }
}
