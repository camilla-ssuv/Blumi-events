'use client'

import { useState, useTransition } from 'react'
import { gerarCsvSubevento } from '@/lib/actions/csv'
import { CheckCircle2, Clock, Download, Loader2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type InscricaoSub = {
  id: string
  created_at: string
  status: string
  participantes: { nome: string; email: string } | null
  checkins: { id: string; cancelado: boolean; created_at: string }[] | null
}

type VisitaSub = {
  id: string
  created_at: string
  inscricoes: {
    participantes: { nome: string; email: string } | null
  } | null
}

type Props = {
  subeventoId: string
  eventoId: string
  modo: 'inscricao' | 'checkin_livre'
  inscricoes: InscricaoSub[]
  visitas: VisitaSub[]
}

export function SubeventoParticipantes({ subeventoId, eventoId, modo, inscricoes, visitas }: Props) {
  const [pending, startTransition] = useTransition()

  function handleExportarCsv() {
    startTransition(async () => {
      const csv = await gerarCsvSubevento(subeventoId, eventoId)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subevento-${subeventoId}.csv`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  if (modo === 'checkin_livre') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <Users size={11} /> {visitas.length} visita{visitas.length !== 1 ? 's' : ''}
          </p>
        </div>
        {visitas.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">Nenhuma visita registrada ainda.</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {visitas.slice(0, 50).map((v) => (
              <div key={v.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-gray-700 truncate">{v.inscricoes?.participantes?.nome ?? '—'}</span>
                <span className="text-gray-400 shrink-0 ml-2">
                  {new Date(v.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const presentes = inscricoes.filter((i) => (i.checkins ?? []).some((c) => !c.cancelado)).length

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
          <Users size={11} /> {inscricoes.length} inscrito{inscricoes.length !== 1 ? 's' : ''}
          {inscricoes.length > 0 && (
            <span className="text-status-success font-semibold">· {presentes} presentes</span>
          )}
        </p>
        {inscricoes.length > 0 && (
          <button
            onClick={handleExportarCsv}
            disabled={pending}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-navy transition-colors disabled:opacity-50"
          >
            {pending ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
            CSV
          </button>
        )}
      </div>

      {inscricoes.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">Nenhuma inscrição ainda.</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {inscricoes.map((i) => {
            const checkin = (i.checkins ?? []).find((c) => !c.cancelado)
            return (
              <div key={i.id} className="flex items-center gap-2 text-xs py-1">
                <span className={cn(
                  'shrink-0',
                  checkin ? 'text-status-success' : 'text-gray-300'
                )}>
                  {checkin ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                </span>
                <span className="text-gray-700 truncate flex-1">{i.participantes?.nome ?? '—'}</span>
                {checkin && (
                  <span className="text-gray-400 shrink-0">
                    {new Date(checkin.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
