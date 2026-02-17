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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Mockup mode: always open admin shell without auth/API checks.
  return <AdminShell isAuthenticated>{children}</AdminShell>
}
