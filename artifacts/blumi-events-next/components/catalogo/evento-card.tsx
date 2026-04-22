'use client'

import Link from 'next/link'
import { Calendar, MapPin, Lock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Evento = {
  id: string
  slug: string
  nome: string
  tipo: string
  visibilidade: string
  data_inicio: string | null
  cidade: string | null
  vagas_total: number | null
  tenants: { nome: string; cor_primaria: string; logo_url: string | null } | null
}

const TIPO_LABEL: Record<string, string> = {
  simples: 'PALESTRA',
  feira: 'FEIRA',
}

function vagasColor(vagas: number | null): string {
  if (!vagas) return ''
  // Não temos vagas ocupadas aqui — mostramos só o total
  // A lógica de % ocupado virá quando tivermos contagem de inscrições
  return 'text-status-success'
}

export function EventoCard({ evento }: { evento: Evento }) {
  const cor = evento.tenants?.cor_primaria ?? '#314C5D'
  const href = `/eventos/${evento.slug}`

  return (
    <Link
      href={href}
      className="group bg-white rounded-card shadow-card hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col"
    >
      {/* Capa */}
      <div
        className="h-44 relative flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${cor}ee, ${cor}99)` }}
      >
        {evento.tenants?.logo_url ? (
          <img
            src={evento.tenants.logo_url}
            alt={evento.tenants.nome}
            className="max-h-16 max-w-[70%] object-contain drop-shadow"
          />
        ) : (
          <span className="font-display font-extrabold text-white/30 text-5xl select-none">
            {evento.tenants?.nome?.[0]?.toUpperCase()}
          </span>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
            {TIPO_LABEL[evento.tipo] ?? evento.tipo.toUpperCase()}
          </span>
        </div>

        {evento.visibilidade === 'convite' && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white text-gray-700">
              <Lock size={11} /> Por convite
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {evento.tenants?.nome}
        </p>
        <h3 className="font-display font-bold text-brand-navy text-base leading-snug line-clamp-2 group-hover:text-brand-navy/80 transition-colors">
          {evento.nome}
        </h3>

        <div className="flex flex-col gap-1 mt-auto pt-2">
          {evento.data_inicio && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={12} />
              {new Date(evento.data_inicio).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          )}
          {evento.cidade && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin size={12} />
              {evento.cidade}
            </span>
          )}
          {evento.vagas_total && (
            <span className={cn('flex items-center gap-1.5 text-xs font-medium mt-0.5', vagasColor(evento.vagas_total))}>
              <Users size={12} />
              {evento.vagas_total} vagas
            </span>
          )}
        </div>

        <div className="mt-3">
          <span
            className={cn(
              'inline-block w-full text-center text-sm font-semibold py-2 rounded-btn transition-colors',
              evento.visibilidade === 'convite'
                ? 'border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'
                : 'bg-brand-lime text-gray-900 hover:opacity-90'
            )}
          >
            {evento.visibilidade === 'convite' ? 'Ver evento' : 'Inscrever-se'}
          </span>
        </div>
      </div>
    </Link>
  )
}
