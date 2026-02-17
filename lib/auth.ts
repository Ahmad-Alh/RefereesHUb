import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// ─── Demo / Mockup Mode ──────────────────────────────────────────────────────
// Admin credentials come from environment variables — no database required.
// Set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel env vars or your .env file.
// Defaults: admin@refereeshub.com / Admin@2025!
// ─────────────────────────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
        }

        const admins = [
          {
            id: 'admin',
            email: process.env.ADMIN_EMAIL ?? 'admin@refereeshub.com',
            password: process.env.ADMIN_PASSWORD ?? 'Admin@2025!',
            name: process.env.ADMIN_NAME ?? 'Admin',
          },
          {
            id: 'admin1',
            email: process.env.ADMIN1_EMAIL ?? 'admin1',
            password: process.env.ADMIN1_PASSWORD ?? 'Admin@2025!',
            name: process.env.ADMIN1_NAME ?? 'Admin 1',
          },
        ]

        const matchedAdmin = admins.find(
          (admin) =>
            credentials.email.toLowerCase() === admin.email.toLowerCase() &&
            credentials.password === admin.password
        )

        if (!matchedAdmin) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
        }

        return {
          id: matchedAdmin.id,
          email: matchedAdmin.email,
          name: matchedAdmin.name,
          role: 'ADMIN',
          refereeNumber: '0000',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.refereeNumber = user.refereeNumber
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.refereeNumber = token.refereeNumber as string
      }
      return session
    },
  },
  pages: {
    signIn: '/admin',
    error: '/admin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const getSession = () => getServerSession(authOptions)

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}
