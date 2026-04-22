import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth/session'
import { InscricaoCard } from '@/components/minha-area/inscricao-card'
import type { InscricaoMinhaAreaRow } from '@/lib/supabase/database.types'

export default async function MinhaAreaPage() {
  const session = await getServerSession()
  if (!session) return null

  const supabase = await createClient()

  const { data: inscricoes } = await supabase
    .from('inscricoes')
    .select(`
      id, qr_token, status, created_at,
      eventos ( id, slug, nome, tipo, data_inicio, data_fim, cidade, emitir_certificados, tenants ( nome, cor_primaria ) ),
      subeventos ( id, nome, data_inicio ),
      checkins ( id, cancelado, created_at )
    `)
    .eq('participante_id', session.user.user_id)
    .order('created_at', { ascending: false })

  const typed = (inscricoes ?? []) as unknown as InscricaoMinhaAreaRow[]
  const ativas = typed.filter(
    (i) => i.status === 'confirmada' && new Date(i.eventos?.data_fim ?? i.eventos?.data_inicio ?? '') >= new Date()
  )
  const anteriores = typed.filter(
    (i) => i.status !== 'confirmada' || new Date(i.eventos?.data_fim ?? i.eventos?.data_inicio ?? '') < new Date()
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Minha Área</h1>
        <p className="text-gray-500 mt-1">Seus eventos e QR codes de acesso</p>
      </div>

      {typed.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🎟️</p>
          <h2 className="font-display font-bold text-brand-navy text-xl mb-2">Nenhuma inscrição ainda</h2>
          <p className="text-gray-400 mb-6">Explore eventos e inscreva-se.</p>
          <a
            href="/eventos"
            className="inline-block bg-brand-lime text-gray-900 font-bold px-6 py-2.5 rounded-btn hover:opacity-90 transition-opacity"
          >
            Ver eventos
          </a>
        </div>
      )}

      {ativas.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Próximos eventos ({ativas.length})
          </h2>
          <div className="space-y-4">
            {ativas.map((i) => (
              <InscricaoCard key={i.id} inscricao={i} />
            ))}
          </div>
        </section>
      )}

      {anteriores.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Histórico ({anteriores.length})
          </h2>
          <div className="space-y-4">
            {anteriores.map((i) => (
              <InscricaoCard key={i.id} inscricao={i} passado />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
