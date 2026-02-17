'use client'

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function SessionProvider({ children }: Props) {
  // Mockup mode: disable NextAuth session polling to avoid /api/auth calls.
  return <>{children}</>
}
