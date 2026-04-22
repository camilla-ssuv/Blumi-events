'use client'

import { useState } from 'react'
import { Calendar, MapPin, CheckCircle2, Clock, ChevronDown, ChevronUp, Award } from 'lucide-react'
import { QrCode } from './qr-code'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Checkin = { id: string; cancelado: boolean; created_at: string }

type Inscricao = {
  id: string
  qr_token: string
  status: string
  created_at: string
  eventos: {
    id: string
    slug: string
    nome: string
    tipo: string
    data_inicio: string | null
    data_fim: string | null
    cidade: string | null
    emitir_certificados?: boolean
    tenants: { nome: string; cor_primaria: string | null } | null
  } | null
  subeventos: { id: string; nome: string; data_inicio: string | null } | null
  checkins: Checkin[] | null
}

type Props = {
  inscricao: Inscricao
  passado?: boolean
}

export function InscricaoCard({ inscricao, passado = false }: Props) {
  const [mostrarQr, setMostrarQr] = useState(false)
  const evento = inscricao.eventos
  const checkin = (inscricao.checkins ?? []).find((c) => !c.cancelado)
  const cor = evento?.tenants?.cor_primaria ?? '#314C5D'

  if (!evento) return null

  return (
    <div className={cn(
      'bg-white rounded-card shadow-card overflow-hidden',
      passado && 'opacity-70'
    )}>
      {/* Barra colorida */}
      <div className="h-1.5" style={{ backgroundColor: cor }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-0.5">
              {evento.tenants?.nome}
            </p>
            <h3 className="font-display font-bold text-brand-navy text-base leading-snug truncate">
              {evento.nome}
            </h3>
            {inscricao.subeventos && (
              <p className="text-xs text-gray-500 mt-0.5">↳ {inscricao.subeventos.nome}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-2">
              {evento.data_inicio && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar size={11} />
                  {new Date(evento.data_inicio).toLocaleDateString('pt-BR', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              )}
              {evento.cidade && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin size={11} />
                  {evento.cidade}
                </span>
              )}
            </div>
          </div>

          {/* Status de check-in */}
          <div className="shrink-0 text-right">
            {checkin ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-status-success">
                <CheckCircle2 size={13} /> Check-in feito
              </span>
            ) : passado ? (
              <span className="text-xs text-gray-400">Não compareceu</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={13} /> Aguardando
              </span>
            )}
          </div>
        </div>

        {/* Link do certificado */}
        {checkin && evento.emitir_certificados && (
          <div className="mt-4">
            <Link
              href={`/certificado/${inscricao.qr_token}`}
              target="_blank"
              className="flex items-center gap-2 text-sm font-medium text-brand-navy hover:opacity-70 transition-opacity"
            >
              <Award size={15} className="text-brand-lime" />
              Ver certificado de participação
            </Link>
          </div>
        )}

        {/* QR Code toggle */}
        {!passado && inscricao.status === 'confirmada' && !checkin && (
          <div className="mt-4">
            <button
              onClick={() => setMostrarQr(!mostrarQr)}
              className="flex items-center gap-2 text-sm font-medium text-brand-navy hover:opacity-70 transition-opacity"
            >
              {mostrarQr ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {mostrarQr ? 'Ocultar QR Code' : 'Ver QR Code de acesso'}
            </button>

            {mostrarQr && (
              <div className="mt-4 flex flex-col items-center gap-3 py-4 bg-gray-50 rounded-btn">
                <QrCode value={inscricao.qr_token} size={180} />
                <p className="text-xs text-gray-400 font-mono">{inscricao.qr_token}</p>
                <p className="text-xs text-gray-400 text-center max-w-48">
                  Apresente este QR Code na entrada do evento
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
