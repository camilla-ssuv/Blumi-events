'use client'

import { useState, useMemo } from 'react'
import { Users, Eye, MapPin, Calendar, Search, CheckCircle2, Clock, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

type ParticipanteRow = {
  nome: string
  email: string
  tipoIngresso: string | null
  hora: string | null
  dataCheckin: string | null
  presente: boolean
}

type RespostaConsolidada = {
  enunciado: string
  tipo: string
  distribuicao: { valor: string; count: number }[]
}

type Props = {
  subevento: {
    nome: string
    modo_inscricao: string
    tipo_tag?: string | null
    local?: string | null
    data_inicio?: string | null
    eventos: {
      nome: string
      tenants: { nome: string; cor_primaria?: string | null } | null
    } | null
  }
  modo: 'A' | 'B'
  participantes: ParticipanteRow[]
  totalVisitas: number
  totalUnicos: number
  consolidado: RespostaConsolidada[]
  views: number
}

export function DashboardExpositor({
  subevento, modo, participantes, totalVisitas, totalUnicos, consolidado, views,
}: Props) {
  const [busca, setBusca] = useState('')
  const [filtroDia, setFiltroDia] = useState('')
  const [filtroTag, setFiltroTag] = useState('')
  const cor = subevento.eventos?.tenants?.cor_primaria ?? '#314C5D'

  // Dias únicos com check-ins/visitas
  const diasDisponiveis = useMemo(() => {
    const set = new Set<string>()
    for (const p of participantes) {
      if (p.dataCheckin) {
        set.add(new Date(p.dataCheckin).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }))
      }
    }
    return Array.from(set).sort()
  }, [participantes])

  // Tags/tipos de ingresso únicos (Modo A)
  const tagsDisponiveis = useMemo(() => {
    const set = new Set<string>()
    for (const p of participantes) {
      if (p.tipoIngresso) set.add(p.tipoIngresso)
    }
    return Array.from(set).sort()
  }, [participantes])

  const filtrados = useMemo(() => participantes.filter((p) => {
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase()) && !p.email.toLowerCase().includes(busca.toLowerCase())) return false
    if (filtroDia && p.dataCheckin) {
      const dia = new Date(p.dataCheckin).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      if (dia !== filtroDia) return false
    } else if (filtroDia && !p.dataCheckin) {
      return false
    }
    if (filtroTag && p.tipoIngresso !== filtroTag) return false
    return true
  }), [participantes, busca, filtroDia, filtroTag])

  const presentes = participantes.filter((p) => p.presente).length
  const temFiltros = diasDisponiveis.length > 1 || tagsDisponiveis.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div style={{ backgroundColor: cor }} className="text-white px-6 py-8">
        <p className="text-sm opacity-70 mb-1">
          {subevento.eventos?.nome} · {subevento.eventos?.tenants?.nome}
        </p>
        <h1 className="font-display font-bold text-2xl mb-1">{subevento.nome}</h1>
        <div className="flex flex-wrap gap-4 text-sm opacity-80 mt-3">
          {subevento.local && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> {subevento.local}
            </span>
          )}
          {subevento.data_inicio && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(subevento.data_inicio).toLocaleDateString('pt-BR', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Eye size={14} /> {views} visualizações
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MetricCard
            label={modo === 'B' ? 'Total de visitas' : 'Inscritos'}
            value={modo === 'B' ? totalVisitas : participantes.length}
            icon={<Users size={18} />}
          />
          {modo === 'B' ? (
            <MetricCard label="Visitantes únicos" value={totalUnicos} icon={<Users size={18} />} />
          ) : (
            <MetricCard label="Presentes" value={presentes} icon={<CheckCircle2 size={18} />} />
          )}
          {modo === 'A' && (
            <MetricCard
              label="Taxa de presença"
              value={participantes.length > 0 ? `${Math.round((presentes / participantes.length) * 100)}%` : '—'}
              icon={<CheckCircle2 size={18} />}
              highlight
            />
          )}
        </div>

        {/* Lista de participantes */}
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-brand-navy text-sm">
                {modo === 'B' ? 'Visitantes' : 'Participantes inscritos'}
              </h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar…"
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-btn text-xs focus:outline-none focus:border-brand-navy w-48"
                />
              </div>
            </div>
            {temFiltros && (
              <div className="flex flex-wrap gap-2">
                <Filter size={13} className="text-gray-400 mt-1.5 shrink-0" />
                {diasDisponiveis.length > 1 && (
                  <select
                    value={filtroDia}
                    onChange={(e) => setFiltroDia(e.target.value)}
                    className="border border-gray-200 rounded-btn text-xs px-2 py-1.5 focus:outline-none focus:border-brand-navy text-gray-600 bg-white"
                  >
                    <option value="">Todos os dias</option>
                    {diasDisponiveis.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                )}
                {tagsDisponiveis.length > 0 && (
                  <select
                    value={filtroTag}
                    onChange={(e) => setFiltroTag(e.target.value)}
                    className="border border-gray-200 rounded-btn text-xs px-2 py-1.5 focus:outline-none focus:border-brand-navy text-gray-600 bg-white"
                  >
                    <option value="">Todos os tipos</option>
                    {tagsDisponiveis.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
                {(filtroDia || filtroTag) && (
                  <button
                    onClick={() => { setFiltroDia(''); setFiltroTag('') }}
                    className="text-xs text-gray-400 hover:text-status-error transition-colors"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {filtrados.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Nenhum resultado.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Nome</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide hidden sm:table-cell">E-mail</th>
                  {modo === 'A' && tagsDisponiveis.length > 0 && (
                    <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide hidden md:table-cell">Ingresso</th>
                  )}
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">
                    {modo === 'B' ? 'Horário' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800">{p.nome}</td>
                    <td className="px-5 py-3 text-gray-400 hidden sm:table-cell">{p.email}</td>
                    {modo === 'A' && tagsDisponiveis.length > 0 && (
                      <td className="px-5 py-3 hidden md:table-cell">
                        {p.tipoIngresso && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{p.tipoIngresso}</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3 text-right">
                      {modo === 'B' ? (
                        <span className="text-xs text-gray-400">{p.hora ?? '—'}</span>
                      ) : p.presente ? (
                        <span className="inline-flex items-center gap-1 text-xs text-status-success font-medium">
                          <CheckCircle2 size={11} /> {p.hora}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-300">
                          <Clock size={11} /> Aguardando
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Consolidado de triagem */}
        {consolidado.length > 0 && (
          <div className="bg-white rounded-card shadow-card p-5 space-y-6">
            <h2 className="font-semibold text-brand-navy text-sm">Respostas de triagem</h2>
            {consolidado.map((q, qi) => {
              const total = q.distribuicao.reduce((s, r) => s + r.count, 0)
              return (
                <div key={qi} className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">{q.enunciado}</p>
                  {q.distribuicao.map((r, ri) => {
                    const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
                    return (
                      <div key={ri} className="space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 truncate">{r.valor}</span>
                          <span className="text-gray-400 font-medium ml-2">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-navy rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-300 pb-4">Powered by Blūmi Events</p>
      </div>
    </div>
  )
}

function MetricCard({
  label, value, icon, highlight,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className={cn(
      'bg-white rounded-card shadow-card px-4 py-4',
      highlight && 'border-l-4 border-brand-lime'
    )}>
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="font-display font-extrabold text-2xl text-brand-navy">{value}</p>
    </div>
  )
}
