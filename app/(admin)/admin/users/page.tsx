'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { formatDateAr } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Admin {
  id: string
  refereeNumber: string
  name: string
  email: string
  role: string
  adminStatus: string | null
  createdAt: string
}

interface StatusCounts {
  PENDING: number
  APPROVED: number
  REJECTED: number
}

type StatusFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED'

export default function AdminUsersPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [counts, setCounts] = useState<StatusCounts>({ PENDING: 0, APPROVED: 0, REJECTED: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const url = filter === 'all'
        ? '/api/admin/users'
        : `/api/admin/users?status=${filter}`
      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 401) {
          setError('غير مصرح - يتطلب صلاحية المالك')
          return
        }
        throw new Error('Failed to fetch admins')
      }

      const data = await response.json()
      setAdmins(data.admins)
      setCounts(data.counts)
    } catch {
      setError('فشل في جلب قائمة المشرفين')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [filter])

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      setActionLoading(userId)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminStatus: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update status')
      }

      // Refresh the list
      await fetchAdmins()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف حساب "${userName}"؟`)) {
      return
    }

    try {
      setActionLoading(userId)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      // Refresh the list
      await fetchAdmins()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
            قيد المراجعة
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            مفعّل
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            مرفوض
          </span>
        )
      default:
        return null
    }
  }

  if (error === 'غير مصرح - يتطلب صلاحية المالك') {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">غير مصرح</h2>
        <p className="text-gray-500 mb-6">هذه الصفحة متاحة فقط للمالك (SUPER_ADMIN)</p>
        <button
          onClick={() => router.push('/admin')}
          className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          العودة للوحة التحكم
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronRight className="w-5 h-5" />
          <span>العودة</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المشرفين</h1>
            <p className="text-gray-500 mt-1">الموافقة على طلبات المشرفين الجدد</p>
          </div>
          <button
            onClick={fetchAdmins}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{counts.PENDING}</div>
          <div className="text-sm text-amber-600">قيد المراجعة</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{counts.APPROVED}</div>
          <div className="text-sm text-green-600">مفعّل</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{counts.REJECTED}</div>
          <div className="text-sm text-red-600">مرفوض</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'PENDING', label: 'قيد المراجعة' },
          { key: 'APPROVED', label: 'مفعّل' },
          { key: 'REJECTED', label: 'مرفوض' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as StatusFilter)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              filter === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && error !== 'غير مصرح - يتطلب صلاحية المالك' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
        </div>
      ) : admins.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا يوجد مشرفين في هذه الفئة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{admin.name}</h3>
                      {admin.role === 'SUPER_ADMIN' && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                          المالك
                        </span>
                      )}
                      {getStatusBadge(admin.adminStatus)}
                    </div>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      رقم الحكم: {admin.refereeNumber} • {formatDateAr(new Date(admin.createdAt))}
                    </p>
                  </div>
                </div>

                {admin.role !== 'SUPER_ADMIN' && (
                  <div className="flex items-center gap-2">
                    {admin.adminStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(admin.id, 'APPROVED')}
                          disabled={actionLoading === admin.id}
                          className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === admin.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                          موافقة
                        </button>
                        <button
                          onClick={() => handleStatusChange(admin.id, 'REJECTED')}
                          disabled={actionLoading === admin.id}
                          className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === admin.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                          رفض
                        </button>
                      </>
                    )}
                    {admin.adminStatus === 'APPROVED' && (
                      <button
                        onClick={() => handleStatusChange(admin.id, 'PENDING')}
                        disabled={actionLoading === admin.id}
                        className="flex items-center gap-1 px-3 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === admin.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        تعليق
                      </button>
                    )}
                    {admin.adminStatus === 'REJECTED' && (
                      <button
                        onClick={() => handleStatusChange(admin.id, 'APPROVED')}
                        disabled={actionLoading === admin.id}
                        className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === admin.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                        تفعيل
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(admin.id, admin.name)}
                      disabled={actionLoading === admin.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === admin.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
