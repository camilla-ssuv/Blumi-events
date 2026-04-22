import { notFound } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth/session'
import { EventoDetalhe } from '@/components/eventos/evento-detalhe'
import type { InscricaoAdminRow } from '@/lib/supabase/database.types'

export default async function EventoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab = 'config' } = await searchParams
  const session = await getServerSession()
  const supabase = await createClient()

  const [
    { data: evento },
    { data: perguntas },
    { data: subeventosRaw },
    { data: participantes },
    { data: tipos },
    { data: dispositivos },
    { data: respostas },
  ] = await Promise.all([
    supabase.from('eventos').select('*').eq('id', id).single(),
    supabase.from('perguntas_triagem').select('*').eq('evento_id', id).order('ordem'),
    supabase.from('subeventos').select('*').eq('evento_id', id).order('created_at'),
    supabase
      .from('inscricoes')
      .select(`
        id, created_at, qr_token, status,
        participantes ( nome, email ),
        tipos_ingresso ( nome ),
        checkins ( id, cancelado, created_at )
      `)
      .eq('evento_id', id)
      .is('subevento_id', null)
      .order('created_at'),
    supabase.from('tipos_ingresso').select('*').eq('evento_id', id).order('created_at'),
    supabase
      .from('dispositivos')
      .select('id, nome, tipo, ativo, codigo_sessao, codigo_expira_em, subeventos ( nome )')
      .eq('evento_id', id)
      .order('created_at'),
    supabase
      .from('respostas_triagem')
      .select('pergunta_id, resposta, opcoes, inscricoes!inner ( evento_id )')
      .eq('inscricoes.evento_id', id),
  ])

  if (!evento) notFound()

  // Garante que o usuário pertence ao tenant do evento (super_admin bypassa)
  if (session?.user.role !== 'super_admin') {
    const serviceClient = await createServiceClient()
    const { data: tenant } = await serviceClient
      .from('tenants')
      .select('id')
      .eq('external_company_id', session?.user.company_id ?? '')
      .single()
    if (!tenant || evento.tenant_id !== tenant.id) notFound()
  }

  // Enrich subeventos with participants, visits and expositor links
  const subeventoIds = (subeventosRaw ?? []).map((s) => s.id)
  const [
    { data: inscricoesSubs },
    { data: visitasSubs },
    { data: linksSubs },
  ] = subeventoIds.length > 0
    ? await Promise.all([
        supabase
          .from('inscricoes')
          .select('id, created_at, status, subevento_id, participantes ( nome, email ), checkins ( id, cancelado, created_at )')
          .in('subevento_id', subeventoIds)
          .order('created_at'),
        supabase
          .from('visitas_subevento')
          .select('id, created_at, subevento_id, inscricoes ( participantes ( nome, email ) )')
          .in('subevento_id', subeventoIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('links_expositor')
          .select('id, token, views, created_at, subevento_id')
          .in('subevento_id', subeventoIds)
          .eq('ativo', true),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  type SubeventoWithExtras = typeof subeventosRaw extends (infer T)[] | null ? T & {
    inscricoes: InscricaoAdminRow[]
    visitas: { id: string; created_at: string; subevento_id: string; inscricoes: { participantes: { nome: string; email: string } | null } | null }[]
    link_ativo: { id: string; token: string; views: number; created_at: string; subevento_id: string } | null
  } : never

  const subeventos = (subeventosRaw ?? []).map((s) => ({
    ...s,
    inscricoes: ((inscricoesSubs ?? []).filter((i) => i.subevento_id === s.id) as unknown as InscricaoAdminRow[]),
    visitas: (visitasSubs ?? []).filter((v) => v.subevento_id === s.id),
    link_ativo: (linksSubs ?? []).find((l) => l.subevento_id === s.id) ?? null,
  })) as unknown as SubeventoWithExtras[]

  type DispositivoAdminRow = {
    id: string; nome: string; tipo: string; ativo: boolean
    codigo_sessao: string; codigo_expira_em: string
    subeventos: { nome: string } | null
  }

  type RespostaAdminRow = {
    pergunta_id: string; resposta: string | null; opcoes: string[] | null
  }

  return (
    <EventoDetalhe
      evento={evento}
      perguntas={perguntas ?? []}
      subeventos={subeventos as any}
      participantes={(participantes ?? []) as unknown as InscricaoAdminRow[]}
      tiposIngresso={tipos ?? []}
      dispositivos={(dispositivos ?? []) as unknown as DispositivoAdminRow[]}
      respostas={(respostas ?? []) as unknown as RespostaAdminRow[]}
      tabInicial={tab}
    />
  )
}
