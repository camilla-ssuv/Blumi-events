'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Users, TrendingUp, Activity, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type CheckinItem = {
  id: string
  created_at: string
  origem: string
  participante_nome: string
}

type Props = {
  eventoId: string
  eventoNome: string
  checkinsIniciais: CheckinItem[]
  totalInscritos: number
}

export function PainelAoVivo({ eventoId, eventoNome, checkinsIniciais, totalInscritos }: Props) {
  const [checkins, setCheckins] = useState<CheckinItem[]>(checkinsIniciais)
  const [novoFlash, setNovoFlash] = useState(false)

  const totalPresentes = checkins.length

  // Conta por origem
  const porOrigem = checkins.reduce<Record<string, number>>((acc, c) => {
    acc[c.origem] = (acc[c.origem] ?? 0) + 1
    return acc
  }, {})

  // Check-ins por hora (últimas 8h)
  const porHora: Record<number, number> = {}
  checkins.forEach((c) => {
    const h = new Date(c.created_at).getHours()
    porHora[h] = (porHora[h] ?? 0) + 1
  })

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`painel-evento-${eventoId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'checkins',
      }, async (payload: any) => {
        if (payload.new.cancelado) return

        const { data } = await supabase
          .from('checkins')
          .select(`
            id, created_at, origem,
            inscricoes!inner ( evento_id, participantes ( nome ) )
          `)
          .eq('id', payload.new.id)
          .single()

        if (!data) return
        const insc = data.inscricoes as unknown as { evento_id: string; participantes: { nome: string } | null } | null
        if (insc?.evento_id !== eventoId) return

        const novoItem: CheckinItem = {
          id: data.id,
          created_at: data.created_at,
          origem: data.origem,
          participante_nome: insc?.participantes?.nome ?? 'Participante',
        }

        setCheckins((prev) => [novoItem, ...prev])
        setNovoFlash(true)
        setTimeout(() => setNovoFlash(false), 600)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventoId])

  const percentual = totalInscritos > 0
    ? Math.round((totalPresentes / totalInscritos) * 100)
    : 0

  const ORIGEM_LABEL: Record<string, string> = {
    usb: 'Leitor USB',
    camera: 'Câmera',
    manual: 'Manual',
    correcao_admin: 'Correção',
  }

  return (
    <div className="min-h-screen bg-brand-navy text-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/admin/eventos/${eventoId}`}
          className="text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-status-error animate-pulse" />
            <span className="text-xs text-white/60 uppercase tracking-widest font-semibold">Ao Vivo</span>
          </div>
          <h1 className="font-display text-2xl font-bold">{eventoNome}</h1>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className={cn(
          'bg-white/10 rounded-card p-5 transition-all duration-300',
          novoFlash && 'bg-brand-lime/20 scale-105'
        )}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-brand-lime" />
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Presentes</span>
          </div>
          <p className="font-display font-extrabold text-5xl text-brand-lime">{totalPresentes}</p>
        </div>

        <div className="bg-white/10 rounded-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-white/60" />
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Inscritos</span>
          </div>
          <p className="font-display font-extrabold text-5xl text-white">{totalInscritos}</p>
        </div>

        <div className="bg-white/10 rounded-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-white/60" />
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Presença</span>
          </div>
          <p className="font-display font-extrabold text-5xl text-white">{percentual}%</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-white/50 mb-2">
          <span>Progresso de entrada</span>
          <span>{totalPresentes} / {totalInscritos}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div
            className="bg-brand-lime h-3 rounded-full transition-all duration-700"
            style={{ width: `${percentual}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed em tempo real */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-brand-lime" />
            <p className="text-xs text-white/60 uppercase tracking-widest font-semibold">Feed em tempo real</p>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {checkins.length === 0 ? (
              <div className="text-center py-12 text-white/30 text-sm">
                Aguardando os primeiros check-ins…
              </div>
            ) : (
              checkins.map((c, i) => (
                <div
                  key={c.id}
                  className={cn(
                    'flex items-center justify-between bg-white/10 rounded-btn px-4 py-3 transition-all',
                    i === 0 && novoFlash && 'bg-brand-lime/20'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 size={14} className="text-brand-lime shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{c.participante_nome}</p>
                      <p className="text-xs text-white/40">{ORIGEM_LABEL[c.origem] ?? c.origem}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/40 shrink-0 ml-2">
                    {new Date(c.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Por canal */}
        <div>
          <p className="text-xs text-white/60 uppercase tracking-widest font-semibold mb-3">Por canal</p>
          <div className="space-y-3">
            {Object.entries(porOrigem).map(([origem, count]) => {
              const pct = totalPresentes > 0 ? Math.round((count / totalPresentes) * 100) : 0
              return (
                <div key={origem}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">{ORIGEM_LABEL[origem] ?? origem}</span>
                    <span className="text-brand-lime font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-brand-lime h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {Object.keys(porOrigem).length === 0 && (
              <p className="text-white/30 text-sm">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
