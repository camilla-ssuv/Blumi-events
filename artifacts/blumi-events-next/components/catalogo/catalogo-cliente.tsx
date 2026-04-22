'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EventoCard } from './evento-card'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'

type Evento = {
  id: string
  slug: string
  nome: string
  tipo: string
  visibilidade: string
  status: string
  data_inicio: string | null
  data_fim: string | null
  cidade: string | null
  vagas_total: number | null
  tenants: { nome: string; cor_primaria: string; logo_url: string | null } | null
}

export function CatalogoCliente({ eventos }: { eventos: Evento[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [busca, setBusca] = useState(searchParams.get('q') ?? '')
  const [filtroTipo, setFiltroTipo] = useState(searchParams.get('tipo') ?? '')
  const [filtroCidade, setFiltroCidade] = useState(searchParams.get('cidade') ?? '')
  const [filtroEmpresa, setFiltroEmpresa] = useState(searchParams.get('empresa') ?? '')

  const cidades = useMemo(
    () => [...new Set(eventos.map((e) => e.cidade).filter(Boolean))] as string[],
    [eventos]
  )
  const empresas = useMemo(
    () => [...new Set(eventos.map((e) => e.tenants?.nome).filter(Boolean))] as string[],
    [eventos]
  )

  const filtrados = useMemo(() => {
    return eventos.filter((e) => {
      if (busca && !e.nome.toLowerCase().includes(busca.toLowerCase()) &&
          !e.tenants?.nome.toLowerCase().includes(busca.toLowerCase())) return false
      if (filtroTipo && e.tipo !== filtroTipo) return false
      if (filtroCidade && e.cidade !== filtroCidade) return false
      if (filtroEmpresa && e.tenants?.nome !== filtroEmpresa) return false
      return true
    })
  }, [eventos, busca, filtroTipo, filtroCidade, filtroEmpresa])

  function syncUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k)
    })
    router.replace(`/eventos?${params.toString()}`, { scroll: false })
  }

  const selectCls = 'border border-gray-200 rounded-btn px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:border-brand-navy'

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-brand-navy px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3 text-balance">
            Encontre seu próximo{' '}
            <span className="text-brand-lime">evento</span>
          </h1>
          <p className="text-white/60 text-lg mb-8">
            Feiras, palestras e workshops das melhores empresas
          </p>

          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busca}
              onChange={(e) => { setBusca(e.target.value); syncUrl({ q: e.target.value }) }}
              placeholder="Buscar eventos ou empresas…"
              className="w-full pl-11 pr-4 py-3.5 rounded-btn text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 shadow-lg"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <SlidersHorizontal size={15} />
            <span className="font-medium">Filtrar:</span>
          </div>

          {/* Pills de tipo */}
          {(['', 'simples', 'feira'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => { setFiltroTipo(tipo); syncUrl({ tipo }) }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filtroTipo === tipo
                  ? 'bg-brand-navy text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-navy'
              }`}
            >
              {tipo === '' ? 'Todos' : tipo === 'simples' ? 'Palestras' : 'Feiras'}
            </button>
          ))}

          {cidades.length > 0 && (
            <select
              value={filtroCidade}
              onChange={(e) => { setFiltroCidade(e.target.value); syncUrl({ cidade: e.target.value }) }}
              className={selectCls}
            >
              <option value="">Todas as cidades</option>
              {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {empresas.length > 0 && (
            <select
              value={filtroEmpresa}
              onChange={(e) => { setFiltroEmpresa(e.target.value); syncUrl({ empresa: e.target.value }) }}
              className={selectCls}
            >
              <option value="">Todas as empresas</option>
              {empresas.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          )}

          {(busca || filtroTipo || filtroCidade || filtroEmpresa) && (
            <button
              onClick={() => {
                setBusca(''); setFiltroTipo(''); setFiltroCidade(''); setFiltroEmpresa('')
                router.replace('/eventos', { scroll: false })
              }}
              className="text-xs text-gray-400 hover:text-gray-700 underline ml-1"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Grid */}
        {filtrados.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-3">🔍</p>
            <h2 className="font-display font-bold text-brand-navy text-xl mb-2">Nenhum evento encontrado</h2>
            <p className="text-gray-400">Tente outros filtros ou volte em breve.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {filtrados.length} evento{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrados.map((evento) => (
                <EventoCard key={evento.id} evento={evento} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
