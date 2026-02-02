import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
              <p className="text-sm text-gray-500">RefereesHub Admin</p>
            </div>
            <a
              href="/"
              className="text-sm text-green-600 hover:text-green-700"
            >
              العودة للتطبيق →
            </a>
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
