import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { EventoStatusBadge } from '@/components/eventos/evento-status-badge'

export default async function EventosPage() {
  const session = await getServerSession()
  if (!session) redirect('/login')

  const supabase = await createClient()

  // super_admin vê todos os eventos; company_admin e operator veem apenas os do seu tenant
  let tenantId: string | null = null
  if (session.user.role !== 'super_admin' && session.user.company_id) {
    const serviceClient = await createServiceClient()
    const { data: tenant } = await serviceClient
      .from('tenants')
      .select('id')
      .eq('external_company_id', session.user.company_id)
      .single()
    tenantId = tenant?.id ?? null
  }

  const baseQuery = supabase
    .from('eventos')
    .select('id, nome, tipo, status, visibilidade, data_inicio, cidade, vagas_total')
    .order('created_at', { ascending: false })

  const { data: eventos } = tenantId
    ? await baseQuery.eq('tenant_id', tenantId)
    : await baseQuery

  const porStatus = {
    rascunho:  (eventos ?? []).filter((e) => e.status === 'rascunho'),
    publicado: (eventos ?? []).filter((e) => e.status === 'publicado'),
    encerrado: (eventos ?? []).filter((e) => e.status === 'encerrado'),
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Eventos</h1>
          <p className="text-gray-500 mt-1">{eventos?.length ?? 0} eventos no total</p>
        </div>
        <Link
          href="/admin/eventos/novo"
          className="flex items-center gap-2 bg-brand-lime text-gray-900 font-semibold px-4 py-2.5 rounded-btn hover:opacity-90 transition-opacity text-sm"
        >
          <Plus size={16} />
          Novo evento
        </Link>
      </div>

      {(eventos ?? []).length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🎪</p>
          <h2 className="font-display font-bold text-brand-navy text-xl mb-2">Nenhum evento ainda</h2>
          <p className="text-gray-400 mb-6">Crie seu primeiro evento para começar.</p>
          <Link
            href="/admin/eventos/novo"
            className="inline-flex items-center gap-2 bg-brand-lime text-gray-900 font-semibold px-5 py-2.5 rounded-btn hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Criar evento
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {(['publicado', 'rascunho', 'encerrado'] as const).map((status) => {
            const lista = porStatus[status]
            if (lista.length === 0) return null
            return (
              <section key={status}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  {status === 'publicado' ? 'Ativos' : status === 'rascunho' ? 'Rascunhos' : 'Encerrados'}
                  <span className="ml-2 text-gray-300">({lista.length})</span>
                </h2>
                <div className="space-y-2">
                  {lista.map((evento) => (
                    <Link
                      key={evento.id}
                      href={`/admin/eventos/${evento.id}`}
                      className="flex items-center gap-4 bg-white rounded-card shadow-card px-5 py-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-gray-400 uppercase font-medium">
                            {evento.tipo}
                          </span>
                          {evento.visibilidade === 'convite' && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              Por convite
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-brand-navy truncate">{evento.nome}</p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {evento.cidade && `${evento.cidade} · `}
                          {evento.data_inicio
                            ? new Date(evento.data_inicio).toLocaleDateString('pt-BR')
                            : 'Data não definida'}
                          {evento.vagas_total && ` · ${evento.vagas_total} vagas`}
                        </p>
                      </div>
                      <EventoStatusBadge status={evento.status} />
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
