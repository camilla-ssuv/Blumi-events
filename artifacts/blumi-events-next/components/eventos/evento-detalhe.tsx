'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { EventoForm } from './evento-form'
import { TriagemTab } from '@/components/triagem/triagem-tab'
import { SubeventosTab } from '@/components/subeventos/subeventos-tab'
import { ParticipantesTab } from '@/components/participantes/participantes-tab'
import { TiposIngressoTab } from '@/components/participantes/tipos-ingresso-tab'
import { DispositivosTab } from '@/components/dispositivos/dispositivos-tab'
import { RelatorioTab } from '@/components/eventos/relatorio-tab'
import { CertificadosConfig } from '@/components/eventos/certificados-config'
import { EventoStatusBadge } from './evento-status-badge'
import { publicarEvento, encerrarEvento } from '@/lib/actions/eventos'
import { clonarEvento } from '@/lib/actions/clone'
import { ArrowLeft, Globe, Lock, Radio, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Evento = {
  id: string
  nome: string
  tipo: string
  status: string
  visibilidade: string
  descricao?: string
  codigo_convite?: string
  data_inicio?: string
  data_fim?: string
  cidade?: string
  endereco?: string
  vagas_total?: number
  emitir_certificados?: boolean
  certificado_titulo?: string
  certificado_carga_horaria?: string
}

type Pergunta = {
  id: string
  enunciado: string
  tipo: string
  opcoes: string[] | null
  obrigatoria: boolean
  ordem: number
  condicao_pergunta_id?: string | null
  condicao_valor?: string | null
}

type Subevento = {
  id: string
  nome: string
  descricao?: string
  modo_inscricao: string
  inscricao_automatica: boolean
  data_inicio?: string
  data_fim?: string
  local?: string
  vagas_total?: number
  tipo_tag?: string
}

type Participante = {
  id: string
  created_at: string
  qr_token: string
  status: string
  participantes: { nome: string; email: string } | null
  tipos_ingresso: { nome: string } | null
  checkins: { id: string; cancelado: boolean; created_at: string }[] | null
}

type TipoIngresso = {
  id: string
  nome: string
  descricao: string | null
  vagas: number | null
}

type Dispositivo = {
  id: string
  nome: string
  tipo: string
  ativo: boolean
  codigo_sessao: string
  codigo_expira_em: string
  subeventos: { nome: string } | null
}

type Resposta = {
  pergunta_id: string
  resposta: string | null
  opcoes: string[] | null
}

type Tab = 'config' | 'triagem' | 'subeventos' | 'participantes' | 'ingressos' | 'dispositivos' | 'relatorio' | 'certificados'

type Props = {
  evento: Evento
  perguntas: Pergunta[]
  subeventos: Subevento[]
  participantes: Participante[]
  tiposIngresso: TipoIngresso[]
  dispositivos: Dispositivo[]
  respostas: Resposta[]
  tabInicial: string
}

export function EventoDetalhe({
  evento, perguntas, subeventos, participantes, tiposIngresso, dispositivos, respostas, tabInicial,
}: Props) {
  const [tab, setTab] = useState<Tab>(tabInicial as Tab)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [pendingClone, startCloneTransition] = useTransition()
  const router = useRouter()
  const encerrado = evento.status === 'encerrado'

  async function handlePublicar() {
    setPendingAction('publicar')
    try { await publicarEvento(evento.id) } finally { setPendingAction(null) }
  }

  async function handleEncerrar() {
    if (!confirm('Encerrar o evento? Esta ação não pode ser desfeita.')) return
    setPendingAction('encerrar')
    try { await encerrarEvento(evento.id) } finally { setPendingAction(null) }
  }

  function handleClonar() {
    if (!confirm('Clonar este evento? Será criado um rascunho com as mesmas configurações, sem inscrições ou check-ins.')) return
    startCloneTransition(async () => {
      const novoId = await clonarEvento(evento.id)
      router.push(`/admin/eventos/${novoId}`)
    })
  }

  const TABS: { id: Tab; label: string; show: boolean; badge?: number }[] = [
    { id: 'config',        label: 'Configurações', show: true },
    { id: 'triagem',       label: 'Triagem',       show: true, badge: perguntas.length || undefined },
    { id: 'ingressos',     label: 'Ingressos',     show: true },
    { id: 'subeventos',    label: 'Subeventos',    show: evento.tipo === 'feira', badge: subeventos.length || undefined },
    { id: 'participantes', label: 'Participantes', show: true, badge: participantes.length || undefined },
    { id: 'dispositivos',  label: 'Dispositivos',  show: true, badge: dispositivos.filter((d) => d.ativo).length || undefined },
    { id: 'relatorio',     label: 'Relatório',     show: true },
    { id: 'certificados',  label: 'Certificados',  show: true },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-start gap-3">
          <Link href="/admin/eventos" className="mt-1 text-gray-400 hover:text-brand-navy transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <EventoStatusBadge status={evento.status} />
              <span className="text-xs text-gray-400 uppercase font-medium">{evento.tipo}</span>
              {evento.visibilidade === 'aberto'
                ? <Globe size={13} className="text-gray-400" />
                : <Lock size={13} className="text-gray-400" />}
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-navy">{evento.nome}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {evento.status === 'publicado' && (
            <Link
              href={`/admin/eventos/${evento.id}/ao-vivo`}
              className="flex items-center gap-1.5 bg-status-error/10 text-status-error border border-status-error/20 font-medium px-4 py-2 rounded-btn text-sm hover:bg-status-error/20 transition-colors"
            >
              <Radio size={14} className="animate-pulse" /> Ao Vivo
            </Link>
          )}
          {encerrado && (
            <button
              onClick={handleClonar}
              disabled={pendingClone}
              className="flex items-center gap-1.5 bg-brand-lime text-gray-900 font-semibold px-4 py-2 rounded-btn text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Copy size={14} />
              {pendingClone ? 'Clonando…' : 'Clonar evento'}
            </button>
          )}
          {!encerrado && (
            <>
              {evento.status === 'rascunho' && (
                <button
                  onClick={handlePublicar}
                  disabled={!!pendingAction}
                  className="bg-brand-lime text-gray-900 font-semibold px-4 py-2 rounded-btn text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {pendingAction === 'publicar' ? 'Publicando…' : 'Publicar'}
                </button>
              )}
              {evento.status === 'publicado' && (
                <button
                  onClick={handleEncerrar}
                  disabled={!!pendingAction}
                  className="border border-gray-200 text-gray-600 font-medium px-4 py-2 rounded-btn text-sm hover:border-status-error hover:text-status-error disabled:opacity-50 transition-colors"
                >
                  {pendingAction === 'encerrar' ? 'Encerrando…' : 'Encerrar evento'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {encerrado && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-btn px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Lock size={14} />
          Evento encerrado — somente leitura. Use "Clonar evento" para criar uma nova edição.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.filter((t) => t.show).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              tab === t.id
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            )}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                tab === t.id ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-500'
              )}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo das tabs */}
      {tab === 'config' && (
        encerrado
          ? <EventoReadOnly evento={evento} />
          : <EventoForm eventoId={evento.id} inicial={evento as any} />
      )}
      {tab === 'triagem' && (
        <TriagemTab eventoId={evento.id} perguntas={perguntas} readonly={encerrado} />
      )}
      {tab === 'subeventos' && evento.tipo === 'feira' && (
        <SubeventosTab eventoId={evento.id} subeventos={subeventos} readonly={encerrado} />
      )}
      {tab === 'participantes' && (
        <ParticipantesTab eventoId={evento.id} participantes={participantes} readonly={encerrado} />
      )}
      {tab === 'ingressos' && (
        <TiposIngressoTab eventoId={evento.id} tipos={tiposIngresso} readonly={encerrado} />
      )}
      {tab === 'dispositivos' && (
        <DispositivosTab
          eventoId={evento.id}
          dispositivos={dispositivos}
          subeventos={subeventos.map((s) => ({ id: s.id, nome: s.nome }))}
        />
      )}
      {tab === 'relatorio' && (
        <RelatorioTab
          participantes={participantes}
          perguntas={perguntas}
          respostas={respostas}
        />
      )}
      {tab === 'certificados' && (
        <CertificadosConfig
          eventoId={evento.id}
          emitir={evento.emitir_certificados ?? false}
          titulo={evento.certificado_titulo ?? 'Certificado de Participação'}
          cargaHoraria={evento.certificado_carga_horaria ?? ''}
          encerrado={encerrado}
        />
      )}
    </div>
  )
}

function EventoReadOnly({ evento }: { evento: Evento }) {
  const rows = [
    ['Tipo', evento.tipo],
    ['Visibilidade', evento.visibilidade],
    ['Data início', evento.data_inicio ? new Date(evento.data_inicio).toLocaleString('pt-BR') : '—'],
    ['Data fim', evento.data_fim ? new Date(evento.data_fim).toLocaleString('pt-BR') : '—'],
    ['Cidade', evento.cidade ?? '—'],
    ['Endereço', evento.endereco ?? '—'],
    ['Vagas', evento.vagas_total?.toString() ?? '—'],
  ]
  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-gray-50 last:border-0">
              <td className="px-5 py-3 text-gray-400 font-medium w-40">{label}</td>
              <td className="px-5 py-3 text-gray-700">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {evento.descricao && (
        <div className="px-5 py-4 border-t border-gray-50">
          <p className="text-xs text-gray-400 mb-1 font-medium">Descrição</p>
          <p className="text-sm text-gray-700">{evento.descricao}</p>
        </div>
      )}
    </div>
  )
}
