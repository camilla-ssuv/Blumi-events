import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
// Import estático: resolve em compile time e evita o erro webpack "moduleId is not a function"
// que ocorre com require() dinâmico em funções síncronas no Next.js App Router.
// Em produção (NODE_ENV=production), USE_MOCKS=false e este import é tree-shakeable.
import { createMockClient } from '@/mocks/client'

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && process.env.NODE_ENV !== 'production'

// Helpers para preservar tipos de retorno
function _createPrincipalServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_PRINCIPAL_URL!,
    process.env.SUPABASE_PRINCIPAL_SERVICE_ROLE_KEY!
  )
}

async function _createPrincipalServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_PRINCIPAL_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PRINCIPAL_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
}

type PrincipalServiceClient = ReturnType<typeof _createPrincipalServiceClient>
type PrincipalServerClient  = Awaited<ReturnType<typeof _createPrincipalServerClient>>

export function createPrincipalClient() {
  if (USE_MOCKS) return createMockClient() as unknown as PrincipalServiceClient
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_PRINCIPAL_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PRINCIPAL_ANON_KEY!
  )
}

export function createPrincipalServiceClient(): PrincipalServiceClient {
  if (USE_MOCKS) return createMockClient() as unknown as PrincipalServiceClient
  return _createPrincipalServiceClient()
}

export async function createPrincipalServerClient(): Promise<PrincipalServerClient> {
  if (USE_MOCKS) return createMockClient() as unknown as PrincipalServerClient
  return _createPrincipalServerClient()
}
