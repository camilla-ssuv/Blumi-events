import { createPrincipalServiceClient } from '@/lib/supabase/principal'
import { SuperAdminDashboard } from '@/components/super-admin/super-admin-dashboard'

export default async function SuperAdminPage() {
  // companies, modulos e company_modulos vivem no Supabase Principal — não no Events
  const principal = createPrincipalServiceClient()

  const [{ data: empresas }, { data: modulos }] = await Promise.all([
    principal
      .from('companies')
      .select('id, name')
      .order('name'),
    principal
      .from('modulos')
      .select('id, slug, nome')
      .eq('ativo', true)
      .order('nome'),
  ])

  const { data: company_modulos } = await principal
    .from('company_modulos')
    .select('company_id, modulo_id, ativo, expira_em, config')

  return (
    <SuperAdminDashboard
      empresas={empresas ?? []}
      modulos={modulos ?? []}
      companyModulos={company_modulos ?? []}
    />
  )
}
