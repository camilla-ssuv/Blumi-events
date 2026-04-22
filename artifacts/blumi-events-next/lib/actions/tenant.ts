'use server'

import { createPrincipalServerClient } from '@/lib/supabase/principal'
import { createServiceClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth/session'

export async function ensureTenant(): Promise<string> {
  const session = await getServerSession()
  if (!session) throw new Error('Não autenticado')

  const companyId = session.user.company_id
  if (!companyId) throw new Error('company_id não encontrado na sessão')

  const eventsClient = await createServiceClient()

  const { data: existing } = await eventsClient
    .from('tenants')
    .select('id')
    .eq('external_company_id', companyId)
    .single()

  if (existing) return existing.id

  // Tenta buscar nome da empresa no Principal (DB query, não auth)
  let nomeEmpresa = session.user.name
  try {
    const principalClient = await createPrincipalServerClient()
    const { data: company } = await principalClient
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single()
    if (company?.name) nomeEmpresa = company.name
  } catch {
    // Usa nome do usuário como fallback
  }

  const { data: tenant, error } = await eventsClient
    .from('tenants')
    .insert({ external_company_id: companyId, nome: nomeEmpresa })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return tenant.id
}
