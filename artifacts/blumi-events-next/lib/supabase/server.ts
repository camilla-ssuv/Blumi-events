import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && process.env.NODE_ENV !== 'production'

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

// Helpers extraídos para preservar o tipo de retorno nas funções públicas.
// Quando USE_MOCKS=true, o mock é castado para o mesmo tipo — TypeScript não faz widening para any.

async function _createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: CookieToSet[]) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
}

async function _createServiceClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: CookieToSet[]) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
}

type ServerClient = Awaited<ReturnType<typeof _createClient>>

export async function createClient(): Promise<ServerClient> {
  if (USE_MOCKS) {
    const { createMockClient } = await import('@/mocks/client')
    return createMockClient() as unknown as ServerClient
  }
  return _createClient()
}

export async function createServiceClient(): Promise<ServerClient> {
  if (USE_MOCKS) {
    const { createMockClient } = await import('@/mocks/client')
    return createMockClient() as unknown as ServerClient
  }
  return _createServiceClient()
}
