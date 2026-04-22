'use client'

import { useState } from 'react'
import { Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react'
import { ModalInscricao } from '@/components/inscricao/modal-inscricao'
import { cn } from '@/lib/utils'

type Pergunta = {
  id: string
  enunciado: string
  tipo: string
  opcoes: string[] | null
  obrigatoria: boolean
  ordem: number
}

type Subevento = {
  id: string
  nome: string
  modo_inscricao: string
  inscricao_automatica: boolean
  data_inicio: string | null
  local: string | null
  vagas_total: number | null
  tipo_tag: string | null
}

type Evento = {
  id: string
  slug: string
  nome: string
  descricao: string | null
  tipo: string
  visibilidade: string
  data_inicio: string | null
  data_fim: string | null
  cidade: string | null
  endereco: string | null
  vagas_total: number | null
  codigo_convite?: string
  tenants: { nome: string; cor_primaria: string; logo_url: string | null } | null
  perguntas_triagem: Pergunta[]
  subeventos: Subevento[]
}

type Props = {
  evento: Evento
  jaInscrito: boolean
  logado: boolean
}

export function EventoPublicoCliente({ evento, jaInscrito, logado }: Props) {
  const [modalAberto, setModalAberto] = useState(false)
  const [inscrito, setInscrito] = useState(jaInscrito)
  const cor = evento.tenants?.cor_primaria ?? '#314C5D'

  const subsInscricao = evento.subeventos.filter((s) => s.modo_inscricao === 'inscricao' && !s.inscricao_automatica)
  const subsLivre = evento.subeventos.filter((s) => s.modo_inscricao === 'checkin_livre')

  return (
    <main className="min-h-screen bg-bg">
      {/* Hero */}
      <section
        className="px-6 py-20"
        style={{ background: `linear-gradient(135deg, ${cor}ff, ${cor}99)` }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-white/60 font-semibold text-sm mb-2 uppercase tracking-widest">
            {evento.tenants?.nome}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 text-balance">
            {evento.nome}
          </h1>

          <div className="flex flex-wrap gap-4 text-white/80 text-sm mb-8">
            {evento.data_inicio && (
              <span className="flex items-center gap-2">
                <Calendar size={15} />
                {new Date(evento.data_inicio).toLocaleDateString('pt-BR', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
            )}
            {evento.cidade && (
              <span className="flex items-center gap-2">
                <MapPin size={15} />
                {evento.cidade}{evento.endereco ? ` · ${evento.endereco}` : ''}
              </span>
            )}
            {evento.vagas_total && (
              <span className="flex items-center gap-2">
                <Users size={15} />
                {evento.vagas_total} vagas
              </span>
            )}
          </div>

          {/* CTA */}
          {inscrito ? (
            <div className="flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-btn w-fit backdrop-blur-sm">
              <CheckCircle2 size={18} className="text-brand-lime" />
              Você está inscrito!
            </div>
          ) : (
            <button
              onClick={() => logado ? setModalAberto(true) : window.location.href = '/login'}
              className="bg-brand-lime text-gray-900 font-bold px-8 py-3.5 rounded-btn hover:opacity-90 transition-opacity text-base shadow-lg"
            >
              {logado ? 'Inscrever-se' : 'Entrar para se inscrever'}
            </button>
          )}
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {/* Descrição */}
        <div className="md:col-span-2 space-y-8">
          {evento.descricao && (
            <section>
              <h2 className="font-display font-bold text-brand-navy text-xl mb-3">Sobre o evento</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{evento.descricao}</p>
            </section>
          )}

          {/* Subeventos de inscrição (modo A) */}
          {subsInscricao.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-brand-navy text-xl mb-3">
                O que acontece {evento.tipo === 'feira' ? 'na feira' : 'no evento'}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {subsInscricao.map((sub) => (
                  <SubeventoCard key={sub.id} sub={sub} tipo="inscricao" cor={cor} />
                ))}
              </div>
            </section>
          )}

          {/* Stands / modo B */}
          {subsLivre.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-brand-navy text-xl mb-3">Stands e expositores</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {subsLivre.map((sub) => (
                  <SubeventoCard key={sub.id} sub={sub} tipo="livre" cor={cor} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-card shadow-card p-5 space-y-3">
            <h3 className="font-display font-bold text-brand-navy">Detalhes</h3>
            {[
              ['Tipo', evento.tipo === 'feira' ? 'Feira' : 'Palestra / Workshop'],
              ['Acesso', evento.visibilidade === 'aberto' ? 'Aberto ao público' : 'Por convite'],
              evento.data_inicio && ['Início', new Date(evento.data_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })],
              evento.data_fim && ['Fim', new Date(evento.data_fim).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })],
            ].filter(Boolean).map(([label, value]: any) => (
              <div key={label as string} className="flex justify-between text-sm gap-2">
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-700 font-medium text-right">{value}</span>
              </div>
            ))}
          </div>

          {!inscrito && (
            <button
              onClick={() => logado ? setModalAberto(true) : window.location.href = '/login'}
              className="w-full bg-brand-lime text-gray-900 font-bold py-3 rounded-btn hover:opacity-90 transition-opacity"
            >
              {logado ? 'Inscrever-se agora' : 'Entrar para se inscrever'}
            </button>
          )}
        </div>
      </div>

      {modalAberto && (
        <ModalInscricao
          evento={evento}
          onClose={() => setModalAberto(false)}
          onSuccess={() => { setInscrito(true); setModalAberto(false) }}
        />
      )}
    </main>
  )
}

function SubeventoCard({
  sub, tipo, cor,
}: {
  sub: Subevento
  tipo: 'inscricao' | 'livre'
  cor: string
}) {
  return (
    <div
      className="bg-white rounded-card shadow-card p-4 border-t-4"
      style={{ borderTopColor: cor }}
    >
      {sub.tipo_tag && (
        <span className="text-xs font-medium text-gray-400 uppercase mb-1 block">{sub.tipo_tag}</span>
      )}
      <p className="font-semibold text-brand-navy text-sm mb-2">{sub.nome}</p>
      <div className="space-y-1">
        {sub.data_inicio && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Calendar size={11} />
            {new Date(sub.data_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        )}
        {sub.local && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <MapPin size={11} /> {sub.local}
          </p>
        )}
      </div>
      <div className="mt-3">
        {tipo === 'inscricao' ? (
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            Quero participar →
          </span>
        ) : (
          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
            Entrada livre
          </span>
        )}
      </div>
    </div>
  )
}
