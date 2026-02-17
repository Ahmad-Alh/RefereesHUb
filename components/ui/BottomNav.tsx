'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, Video, FileText, Search, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/documents',
    label: 'المستندات',
    icon: FolderOpen,
  },
  {
    href: '/quizzes',
    label: 'الاختبارات',
    icon: GraduationCap,
  },
  {
    href: '/videos',
    label: 'الفيديو',
    icon: Video,
  },
  {
    href: '/notes',
    label: 'الملاحظات',
    icon: FileText,
  },
  {
    href: '/search',
    label: 'بحث',
    icon: Search,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-lg min-w-[56px] transition-colors',
                isActive
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
