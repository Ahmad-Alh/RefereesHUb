import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  BookOpen,
  Video,
  FileQuestion,
  Users,
  GraduationCap,
  TrendingUp,
  Plus
} from 'lucide-react'
import { toArabicNumerals } from '@/lib/utils'

export default async function AdminDashboard() {
  // Fetch statistics
  const [
    userCount,
    quizCount,
    questionCount,
    videoCount,
    practiceQuestionCount,
    recentAttempts
  ] = await Promise.all([
    prisma.user.count(),
    prisma.quiz.count({ where: { isPractice: false } }),
    prisma.question.count(),
    prisma.video.count(),
    prisma.question.count({
      where: {
        quizQuestions: {
          some: { quiz: { isPractice: true } },
        },
      },
    }),
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
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            href="/admin/quizzes/new"
            icon={GraduationCap}
            label="إنشاء اختبار"
            color="blue"
          />
          <QuickAction
            href="/admin/videos/new"
            icon={Video}
            label="رفع فيديو"
            color="purple"
          />
          <QuickAction
            href="/admin/questions/generate"
            icon={TrendingUp}
            label="توليد أسئلة AI"
            color="orange"
          />
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
          href="/admin/quizzes"
          icon={GraduationCap}
          title="إدارة الاختبارات"
          description="إنشاء ونشر الاختبارات"
        />
        <AdminNavCard
          href="/admin/videos"
          icon={Video}
          title="إدارة الفيديو"
          description="رفع وتنظيم الفيديوهات"
        />
        <AdminNavCard
          href="/admin/analytics"
          icon={TrendingUp}
          title="التحليلات"
          description="عرض إحصائيات الاختبارات"
        />
        <AdminNavCard
          href="/admin/users"
          icon={Users}
          title="إدارة المستخدمين"
          description="عرض وإدارة الحكام"
        />
        <AdminNavCard
          href="/admin/laws"
          icon={BookOpen}
          title="إدارة القوانين"
          description="تحديث نصوص القوانين"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">آخر محاولات الاختبارات</h2>
        {recentAttempts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">لا توجد محاولات بعد</p>
        ) : (
          <div className="space-y-3">
            {recentAttempts.map((attempt) => (
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
}: {
  href: string
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl p-4 border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all"
    >
      <Icon className="w-6 h-6 text-green-600 mb-3" />
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  )
}
