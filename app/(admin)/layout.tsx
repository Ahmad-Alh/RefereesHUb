import { getSession } from '@/lib/auth'
import AdminShell from './AdminShell'

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  // Always render the AdminShell — it handles login vs dashboard view
  return <AdminShell isAuthenticated={isAdmin}>{children}</AdminShell>
}
