import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth/session'
import { ModulosAdminView } from '@/components/super-admin/modulos-admin-view'

export default async function ModulosPage() {
  const session = await getServerSession()
  if (!session) return null

  const supabase = await createClient()

  // Busca todos os módulos globais
  const { data: todosModulos } = await supabase
    .from('modulos')
    .select('id, slug, nome, url_base')
    .eq('ativo', true)
    .order('nome')

  // Busca módulos ativos desta empresa
  const { data: modulosEmpresa } = await supabase
    .from('company_modulos')
    .select('modulo_id, ativo, expira_em, config')

  const ativosMap = new Map(
    (modulosEmpresa ?? []).map((m) => [m.modulo_id, m])
  )

  const modulos = (todosModulos ?? []).map((m) => ({
    ...m,
    contratado: ativosMap.has(m.id) && ativosMap.get(m.id)!.ativo,
    expira_em: ativosMap.get(m.id)?.expira_em ?? null,
  }))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Meus Módulos</h1>
        <p className="text-gray-500 mt-1">Módulos contratados e disponíveis para sua empresa.</p>
      </div>
      <ModulosAdminView modulos={modulos} />
    </div>
  )
}
