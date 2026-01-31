import type { Metadata, Viewport } from 'next'
import './globals.css'
import { BottomNav } from '@/components/ui/BottomNav'

export const metadata: Metadata = {
  title: 'RefereesHub - قوانين اللعبة',
  description: 'منصة تعلم قوانين اللعبة للحكام - Laws of the Game Learning Platform for Referees',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RefereesHub',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="font-arabic bg-gray-50 text-gray-900 min-h-screen pb-20">
        <main className="max-w-lg mx-auto">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
