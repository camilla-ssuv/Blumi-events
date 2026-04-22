import { createBrowserClient } from '@supabase/ssr'
import { createMockClient } from '@/mocks/client'

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && process.env.NODE_ENV !== 'production'

type BrowserClient = ReturnType<typeof createBrowserClient>

export function createClient(): BrowserClient {
  if (USE_MOCKS) return createMockClient() as unknown as BrowserClient
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
