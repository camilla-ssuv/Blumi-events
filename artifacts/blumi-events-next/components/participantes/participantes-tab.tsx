'use client'

import { useState, useMemo, useTransition } from 'react'
import { gerarCsvEvento } from '@/lib/actions/csv'
import { cancelarCheckin } from '@/lib/actions/checkin'
import { InscricaoMassaModal } from './inscricao-massa-modal'
import {
  Search, Download, UserPlus, CheckCircle2, Clock, XCircle, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Checkin = { id: string; cancelado: boolean; created_at: string }

type Participante = {
  id: string
  created_at: string
  qr_token: string
  status: string
  participantes: { nome: string; email: string } | null
  tipos_ingresso: { nome: string } | null
  checkins: Checkin[] | null
}

type Props = {
  eventoId: string
  participantes: Participante[]
  readonly: boolean
}

type FiltroCheckin = 'todos' | 'presentes' | 'ausentes'

export function ParticipantesTab({ eventoId, participantes: inicial, readonly }: Props) {
  const [lista, setLista] = useState(inicial)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<FiltroCheckin>('todos')
  const [massaAberta, setMassaAberta] = useState(false)
  const [cancelandoCheckin, setCancelandoCheckin] = useState<{ checkinId: string; inscricaoId: string; nome: string } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [pendingCsv, startCsvTransition] = useTransition()
  const [pendingCancel, startCancelTransition] = useTransition()

  function checkinValido(p: Participante) {
    return (p.checkins ?? []).some((c) => !c.cancelado)
  }

  const filtrados = useMemo(() => {
    return lista.filter((p) => {
      const nome = p.participantes?.nome?.toLowerCase() ?? ''
      const email = p.participantes?.email?.toLowerCase() ?? ''
      if (busca && !nome.includes(busca.toLowerCase()) && !email.includes(busca.toLowerCase())) return false
      if (filtro === 'presentes' && !checkinValido(p)) return false
      if (filtro === 'ausentes' && checkinValido(p)) return false
      return true
    })
  }, [lista, busca, filtro])

  const total = lista.length
  const presentes = lista.filter(checkinValido).length
  const ausentes = total - presentes

  function handleExportarCsv() {
    startCsvTransition(async () => {
      const csv = await gerarCsvEvento(eventoId)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `participantes-${eventoId}.csv`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  function handleCancelarCheckin() {
    if (!cancelandoCheckin || !motivo.trim()) return
    const { checkinId, inscricaoId } = cancelandoCheckin
    startCancelTransition(async () => {
      await cancelarCheckin(checkinId, inscricaoId, motivo.trim())
      // atualiza estado local: marca checkin como cancelado
      setLista((prev) =>
        prev.map((p) => ({
          ...p,
          checkins: (p.checkins ?? []).map((c) =>
            c.id === checkinId ? { ...c, cancelado: true } : c
          ),
        }))
      )
      setCancelandoCheckin(null)
      setMotivo('')
    })
  }

  return (
    <div className="space-y-4">
      {/* Métricas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Inscritos', valor: total, cor: 'text-brand-navy' },
          { label: 'Presentes', valor: presentes, cor: 'text-status-success' },
          { label: 'Ausentes', valor: ausentes, cor: 'text-gray-400' },
        ].map(({ label, valor, cor }) => (
          <div key={label} className="bg-white rounded-card shadow-card px-4 py-3 text-center">
            <p className={cn('font-display font-extrabold text-3xl', cor)}>{valor}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Barra de ações */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-btn text-sm focus:outline-none focus:border-brand-navy"
          />
        </div>

        <div className="flex gap-1">
          {(['todos', 'presentes', 'ausentes'] as FiltroCheckin[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded-btn transition-colors capitalize',
                filtro === f
                  ? 'bg-brand-navy text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-navy'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          {!readonly && (
            <button
              onClick={() => setMassaAberta(true)}
              className="flex items-center gap-1.5 border border-brand-navy text-brand-navy text-sm font-medium px-3 py-2 rounded-btn hover:bg-brand-navy hover:text-white transition-colors"
            >
              <UserPlus size={14} /> Inscrição em massa
            </button>
          )}
          <button
            onClick={handleExportarCsv}
            disabled={pendingCsv || total === 0}
            className="flex items-center gap-1.5 bg-brand-lime text-gray-900 text-sm font-semibold px-3 py-2 rounded-btn hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Download size={14} />
            {pendingCsv ? 'Gerando…' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {busca || filtro !== 'todos'
              ? 'Nenhum participante encontrado com esses filtros.'
              : 'Nenhum inscrito ainda.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Participante</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Ingresso</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Inscrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                {!readonly && (
                  <th className="px-4 py-3 w-10" />
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((p) => {
                const checkin = (p.checkins ?? []).find((c) => !c.cancelado)
                const presente = !!checkin
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{p.participantes?.nome ?? '—'}</p>
                      <p className="text-xs text-gray-400">{p.participantes?.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-500 text-xs">{p.tipos_ingresso?.nome ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-gray-400">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {presente ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-status-success">
                          <CheckCircle2 size={13} />
                          {new Date(checkin.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : p.status === 'cancelada' ? (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <XCircle size={13} /> Cancelado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock size={13} /> Aguardando
                        </span>
                      )}
                    </td>
                    {!readonly && (
                      <td className="px-4 py-3 text-right">
                        {presente && checkin && (
                          <button
                            onClick={() => setCancelandoCheckin({
                              checkinId: checkin.id,
                              inscricaoId: p.id,
                              nome: p.participantes?.nome ?? 'Participante',
                            })}
                            title="Cancelar check-in"
                            className="p-1.5 text-gray-300 hover:text-status-error rounded transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">Mostrando {filtrados.length} de {total} inscritos</p>

      {/* Modal cancelar check-in */}
      {cancelandoCheckin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCancelandoCheckin(null)} />
          <div className="relative bg-white rounded-card shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-display font-bold text-brand-navy text-lg">Cancelar check-in</h3>
            <p className="text-sm text-gray-600">
              Você está cancelando o check-in de <strong>{cancelandoCheckin.nome}</strong>.
              Esta ação fica registrada no log de auditoria.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Motivo da correção <span className="text-status-error">*</span>
              </label>
              <textarea
                autoFocus
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                placeholder="Ex: participante entrou no evento errado, erro do operador…"
                className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand-navy resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelarCheckin}
                disabled={!motivo.trim() || pendingCancel}
                className="flex-1 bg-status-error text-white font-semibold py-2.5 rounded-btn text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {pendingCancel ? 'Cancelando…' : 'Confirmar cancelamento'}
              </button>
              <button
                onClick={() => { setCancelandoCheckin(null); setMotivo('') }}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-btn text-sm hover:border-gray-400 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {massaAberta && (
        <InscricaoMassaModal
          eventoId={eventoId}
          onClose={() => setMassaAberta(false)}
        />
      )}
    </div>
  )
}
