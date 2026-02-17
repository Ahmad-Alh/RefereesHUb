'use client'

import { useState } from 'react'
import { Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminSetupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    secret: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'فشل في إنشاء الحساب')
      } else {
        setDone(true)
      }
    } catch {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">تم إنشاء حساب المسؤول</h2>
          <p className="text-gray-600 mb-6">يمكنك الآن تسجيل الدخول بالبيانات التي أدخلتها</p>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            الذهاب لتسجيل الدخول
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-gray-900" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">تهيئة حساب المسؤول</h1>
          <p className="text-gray-600 text-sm mt-1">يُستخدم مرة واحدة فقط لإنشاء الحساب الأول</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'الاسم', type: 'text', placeholder: 'اسم المسؤول' },
              { key: 'email', label: 'البريد الإلكتروني', type: 'email', placeholder: 'admin@example.com', dir: 'ltr' },
              { key: 'password', label: 'كلمة المرور (8 أحرف على الأقل)', type: 'password', placeholder: '••••••••' },
              { key: 'secret', label: 'رمز التهيئة (SETUP_SECRET)', type: 'password', placeholder: 'setup-referees-hub', dir: 'ltr' },
            ].map(({ key, label, type, placeholder, dir }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full bg-gray-100 border border-gray-300 text-gray-900 px-3 py-2.5 rounded-lg text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder={placeholder}
                  dir={dir || 'rtl'}
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'جاري الإنشاء...' : 'إنشاء حساب المسؤول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
