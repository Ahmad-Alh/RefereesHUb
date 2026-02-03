import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import {
  BookOpen,
  Video,
  FileQuestion,
  Users,
  GraduationCap,
  TrendingUp,
  Plus,
  FileText,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import { toArabicNumerals } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getSession()
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'

  // Fetch statistics
  const [
    userCount,
    quizCount,
    questionCount,
    videoCount,
    documentCount,
    practiceQuestionCount,
    pendingAdminCount,
    recentAttempts
  ] = await Promise.all([
    prisma.user.count(),
    prisma.quiz.count({ where: { isPractice: false } }),
    prisma.question.count(),
    prisma.video.count(),
    prisma.document.count(),
    prisma.question.count({
      where: {
        quizQuestions: {
          some: { quiz: { isPractice: true } },
        },
      },
    }),
    isSuperAdmin ? prisma.user.count({
      where: { role: 'ADMIN', adminStatus: 'PENDING' }
    }) : Promise.resolve(0),
    prisma.quizAttempt.findMany({
      take: 5,
      orderBy: { startedAt: 'desc' },
      include: {
        user: { select: { name: true, refereeNumber: true } },
        quiz: { select: { titleAr: true } },
      },
    }),
  ])

  return (
    <div className="space-y-6">
      {/* Pending Admins Alert (SUPER_ADMIN only) */}
      {isSuperAdmin && pendingAdminCount > 0 && (
        <Link
          href="/admin/users"
          className="block bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-amber-800">
                لديك {toArabicNumerals(pendingAdminCount)} طلب تسجيل مشرف جديد
              </p>
              <p className="text-sm text-amber-600">اضغط للموافقة أو الرفض</p>
            </div>
          </div>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="المستخدمين"
          value={userCount}
          color="blue"
        />
        <StatCard
          icon={FileQuestion}
          label="الأسئلة"
          value={questionCount}
          color="green"
        />
        <StatCard
          icon={GraduationCap}
          label="الاختبارات"
          value={quizCount}
          color="purple"
        />
        <StatCard
          icon={Video}
          label="الفيديوهات"
          value={videoCount}
          color="orange"
        />
        <StatCard
          icon={FileText}
          label="المستندات"
          value={documentCount}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            href="/admin/questions/new"
            icon={Plus}
            label="إضافة سؤال"
            color="green"
          />
          <QuickAction
            href="/admin/videos"
            icon={Video}
            label="رفع فيديو"
            color="purple"
          />
          <QuickAction
            href="/admin/documents"
            icon={FileText}
            label="رفع مستند"
            color="blue"
          />
          {isSuperAdmin && (
            <QuickAction
              href="/admin/users"
              icon={UserCheck}
              label="إدارة المشرفين"
              color="orange"
            />
          )}
        </div>
      </div>

      {/* Practice Questions Status */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">بنك أسئلة التدريب</h2>
          <span className="text-sm text-gray-500">
            {toArabicNumerals(practiceQuestionCount)} سؤال
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${Math.min((practiceQuestionCount / 200) * 100, 100)}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">
            {toArabicNumerals(practiceQuestionCount)} / ٢٠٠
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          الهدف: ٢٠٠ سؤال في بنك التدريب
        </p>
      </div>

      {/* Admin Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminNavCard
          href="/admin/questions"
          icon={FileQuestion}
          title="إدارة الأسئلة"
          description="عرض وتعديل وحذف الأسئلة"
        />
        <AdminNavCard
          href="/admin/videos"
          icon={Video}
          title="إدارة الفيديوهات"
          description="رفع وتنظيم الفيديوهات"
        />
        <AdminNavCard
          href="/admin/documents"
          icon={FileText}
          title="إدارة المستندات"
          description="رفع وتنظيم الملفات"
        />
        <AdminNavCard
          href="/admin/quizzes"
          icon={GraduationCap}
          title="إدارة الاختبارات"
          description="إنشاء ونشر الاختبارات"
        />
        <AdminNavCard
          href="/admin/analytics"
          icon={TrendingUp}
          title="التحليلات"
          description="عرض إحصائيات الاختبارات"
        />
        <AdminNavCard
          href="/admin/laws"
          icon={BookOpen}
          title="إدارة القوانين"
          description="تحديث نصوص القوانين"
        />
        {isSuperAdmin && (
          <AdminNavCard
            href="/admin/users"
            icon={Users}
            title="إدارة المشرفين"
            description="الموافقة على طلبات المشرفين"
            badge={pendingAdminCount > 0 ? pendingAdminCount : undefined}
          />
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">آخر محاولات الاختبارات</h2>
        {recentAttempts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">لا توجد محاولات بعد</p>
        ) : (
          <div className="space-y-3">
            {recentAttempts.map((attempt: { id: string; user: { name: string | null; refereeNumber: string | null }; quiz: { titleAr: string } | null; score: number | null }) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {attempt.user.name} ({attempt.user.refereeNumber})
                  </p>
                  <p className="text-sm text-gray-500">
                    {attempt.quiz?.titleAr || 'تدريب'}
                  </p>
                </div>
                <div className="text-left">
                  {attempt.score !== null ? (
                    <span className="text-green-600 font-medium">
                      {toArabicNumerals(attempt.score)}%
                    </span>
                  ) : (
                    <span className="text-yellow-600 text-sm">قيد التنفيذ</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{toArabicNumerals(value)}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string
  icon: React.ElementType
  label: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
  }

  return (
    <Link
      href={href}
      className={`${colorClasses[color]} text-white rounded-xl p-4 flex flex-col items-center gap-2 transition-colors`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

function AdminNavCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: string
  icon: React.ElementType
  title: string
  description: string
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl p-4 border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all relative"
    >
      {badge && (
        <span className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {toArabicNumerals(badge)}
        </span>
      )}
      <Icon className="w-6 h-6 text-amber-600 mb-3" />
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  )
}
