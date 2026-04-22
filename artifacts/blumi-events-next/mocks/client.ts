import { MockQueryBuilder } from './query-builder'

// Retorna um objeto com a mesma interface de surface que o @supabase/supabase-js / @supabase/ssr
// Usado exclusivamente em desenvolvimento quando NEXT_PUBLIC_USE_MOCKS=true
export function createMockClient() {
  return {
    from: (table: string) => new MockQueryBuilder(table),
    // Stubs para os métodos de auth que possam ser chamados (ignorados no mock)
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser:    async () => ({ data: { user: null },    error: null }),
    },
  }
}
