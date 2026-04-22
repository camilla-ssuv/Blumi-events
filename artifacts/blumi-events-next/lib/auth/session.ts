'use server'

import { cookies } from 'next/headers'
import type { AuthSession } from '@/types/auth'

export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('blumi_session')?.value
  if (!raw) return null
  try {
    const session: AuthSession = JSON.parse(decodeURIComponent(raw))
    if (session.expires_at < Date.now() / 1000) return null
    return session
  } catch {
    return null
  }
}
