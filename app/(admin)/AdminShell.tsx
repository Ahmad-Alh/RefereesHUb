'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Video,
  FileQuestion,
  BarChart2,
  Shield,
  Menu,
  X,
  FolderOpen,
} from 'lucide-react'

// ─────────────────────────────────────────────
// Admin Sidebar Navigation
// ─────────────────────────────────────────────
const navItems = [
  { href: '/admin/documents', label: 'المستندات', icon: FolderOpen },
  { href: '/admin/videos', label: 'الفيديوهات', icon: Video },
  { href: '/admin/questions', label: 'الأسئلة', icon: FileQuestion },
  { href: '/admin/analytics', label: 'التحليلات', icon: BarChart2 },
]

function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-full bg-white border-l border-gray-200 w-56">
      {/* Brand */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-900 font-bold text-sm">RefereesHub</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <span className="text-xs">←</span>
          العودة للتطبيق
        </Link>
        <div className="w-full px-3 py-2.5 rounded-lg text-xs text-amber-300 bg-amber-50 border border-amber-200">
          وضع تجريبي: اللوحة مفتوحة للعرض فقط
        </div>
      </div>
    </aside>
  )
}

// ─────────────────────────────────────────────
// Main Shell
// ─────────────────────────────────────────────
export default function AdminShell({
  isAuthenticated: _isAuthenticated,
  children,
}: {
  isAuthenticated: boolean
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar - desktop */}
      <div className="hidden lg:flex flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10">
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-gray-900 font-bold text-sm">لوحة التحكم</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
