import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PainelAoVivo } from '@/components/eventos/painel-ao-vivo'

export const revalidate = 0

export default async function AoVivoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: evento }, checkinsResult, inscritosResult] = await Promise.all([
    supabase.from('eventos').select('id, nome, status').eq('id', id).single(),
    supabase
      .from('checkins')
      .select(`
        id, created_at, origem, cancelado,
        inscricoes!inner ( evento_id, participantes ( nome ) )
      `)
      .eq('inscricoes.evento_id', id)
      .eq('cancelado', false)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('inscricoes')
      .select('id', { count: 'exact', head: true })
      .eq('evento_id', id)
      .is('subevento_id', null),
  ])

  if (!evento) notFound()

  const checkins = (checkinsResult.data ?? []).map((c: any) => ({
    id: c.id,
    created_at: c.created_at,
    origem: c.origem,
    participante_nome: c.inscricoes?.participantes?.nome ?? 'Participante',
  }))

  return (
    <PainelAoVivo
      eventoId={id}
      eventoNome={evento.nome}
      checkinsIniciais={checkins}
      totalInscritos={inscritosResult.count ?? 0}
    />
  )
}
