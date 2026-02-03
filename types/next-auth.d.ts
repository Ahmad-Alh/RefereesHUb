import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      refereeNumber: string
      adminStatus: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    refereeNumber: string
    adminStatus: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    refereeNumber: string
    adminStatus: string | null
  }
}
