import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'
import { ShieldCheck, LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Allow access to login and register pages without authentication
  const isAuthPage = pathname.includes('/admin/login') || pathname.includes('/admin/register')

  if (isAuthPage) {
    // If already logged in as approved admin, redirect to dashboard
    if (session?.user &&
        (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') &&
        session.user.adminStatus === 'APPROVED') {
      redirect('/admin')
    }
    // For auth pages, render without the admin wrapper
    return <>{children}</>
  }

  // For non-auth pages, check authentication
  if (!session?.user) {
    redirect('/admin/login')
  }

  // Check if user is an admin
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin/login')
  }

  // Check if admin is approved
  if (session.user.adminStatus === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
            <ShieldCheck className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">حسابك قيد المراجعة</h2>
          <p className="text-gray-600 mb-6">
            طلبك قيد المراجعة من قبل المسؤول. سيتم تفعيل حسابك قريباً.
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm mb-6">
            يرجى التواصل مع المسؤول لتسريع عملية الموافقة
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            العودة للتطبيق الرئيسي
          </Link>
        </div>
      </div>
    )
  }

  if (session.user.adminStatus === 'REJECTED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <ShieldCheck className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">تم رفض طلبك</h2>
          <p className="text-gray-600 mb-6">
            للأسف، تم رفض طلب التسجيل كمشرف. يمكنك التواصل مع المسؤول للمزيد من المعلومات.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            العودة للتطبيق الرئيسي
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">لوحة التحكم</h1>
                <p className="text-xs text-slate-400">RefereesHub Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">{session.user.name}</span>
              {session.user.role === 'SUPER_ADMIN' && (
                <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                  المالك
                </span>
              )}
              <Link
                href="/"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                العودة للتطبيق
              </Link>
              <Link
                href="/api/auth/signout"
                className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                خروج
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
