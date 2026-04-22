import { notFound } from 'next/navigation'
import { buscarDashboardExpositor } from '@/lib/actions/expositor'
import { DashboardExpositor } from '@/components/expositor/dashboard-expositor'

export const revalidate = 60

type VisitaRow = {
  id: string
  created_at: string
  inscricoes: { participantes: { nome: string; email: string } | null } | null
}

type InscricaoExpositorRow = {
  id: string
  created_at: string
  status: string
  participantes: { nome: string; email: string } | null
  tipos_ingresso: { nome: string } | null
  checkins: { id: string; cancelado: boolean; created_at: string }[]
  respostas_triagem: {
    pergunta_id: string
    resposta: string | null
    opcoes: string[] | null
    perguntas_triagem: { enunciado: string; tipo: string } | null
  }[]
}

export default async function DashboardExpositorPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const dados = await buscarDashboardExpositor(token)

  if (!dados) notFound()

  const { subevento, modo, inscricoes, visitas } = dados

  if (modo === 'B') {
    const visitasTyped = (visitas as unknown as VisitaRow[])
    const uniqueMap = new Map<string, { nome: string; email: string; ultima: string }>()
    for (const v of visitasTyped) {
      const email = v.inscricoes?.participantes?.email ?? ''
      if (!uniqueMap.has(email) || v.created_at > uniqueMap.get(email)!.ultima) {
        uniqueMap.set(email, {
          nome: v.inscricoes?.participantes?.nome ?? '—',
          email,
          ultima: v.created_at,
        })
      }
    }

    const participantes = visitasTyped.map((v) => ({
      nome: v.inscricoes?.participantes?.nome ?? '—',
      email: v.inscricoes?.participantes?.email ?? '',
      tipoIngresso: null,
      hora: new Date(v.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dataCheckin: v.created_at,
      presente: true,
    }))

    return (
      <DashboardExpositor
        subevento={subevento}
        modo="B"
        participantes={participantes}
        totalVisitas={visitasTyped.length}
        totalUnicos={uniqueMap.size}
        consolidado={[]}
        views={dados.link.views}
      />
    )
  }

  const inscricoesTyped = (inscricoes as unknown as InscricaoExpositorRow[])

  const participantes = inscricoesTyped.map((i) => {
    const checkin = i.checkins?.find((c) => !c.cancelado)
    return {
      nome: i.participantes?.nome ?? '—',
      email: i.participantes?.email ?? '',
      tipoIngresso: i.tipos_ingresso?.nome ?? null,
      hora: checkin
        ? new Date(checkin.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : null,
      dataCheckin: checkin ? checkin.created_at : null,
      presente: !!checkin,
    }
  })

  const perguntaMap = new Map<string, { enunciado: string; tipo: string; contagens: Map<string, number> }>()
  for (const i of inscricoesTyped) {
    for (const r of i.respostas_triagem ?? []) {
      const p = r.perguntas_triagem
      if (!p || p.tipo === 'texto') continue
      if (!perguntaMap.has(r.pergunta_id)) {
        perguntaMap.set(r.pergunta_id, { enunciado: p.enunciado, tipo: p.tipo, contagens: new Map() })
      }
      const entry = perguntaMap.get(r.pergunta_id)!
      const valores = p.tipo === 'multipla_escolha' ? (r.opcoes ?? []) : [r.resposta ?? '']
      for (const v of valores) {
        entry.contagens.set(v, (entry.contagens.get(v) ?? 0) + 1)
      }
    }
  }

  const consolidado = Array.from(perguntaMap.values()).map((q) => ({
    enunciado: q.enunciado,
    tipo: q.tipo,
    distribuicao: Array.from(q.contagens.entries())
      .map(([valor, count]) => ({ valor, count }))
      .sort((a, b) => b.count - a.count),
  }))

  return (
    <DashboardExpositor
      subevento={subevento}
      modo="A"
      participantes={participantes}
      totalVisitas={0}
      totalUnicos={0}
      consolidado={consolidado}
      views={dados.link.views}
    />
  )
}
