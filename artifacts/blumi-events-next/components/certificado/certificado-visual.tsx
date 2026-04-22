'use client'

import { Printer } from 'lucide-react'

type Props = {
  participanteNome: string
  eventoNome: string
  organizadorNome: string
  dataInicio: string | null
  dataFim: string | null
  titulo: string
  cargaHoraria: string | null
  corPrimaria: string
}

function formatarData(data: string | null): string {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function CertificadoVisual({
  participanteNome, eventoNome, organizadorNome,
  dataInicio, dataFim, titulo, cargaHoraria, corPrimaria,
}: Props) {
  const dataFormatada = dataFim
    ? `${formatarData(dataInicio)} a ${formatarData(dataFim)}`
    : formatarData(dataInicio)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 print:p-0 print:bg-white">
      {/* Botão imprimir — oculto na impressão */}
      <div className="mb-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-brand-navy text-white font-semibold px-5 py-2.5 rounded-btn hover:opacity-90 transition-opacity"
        >
          <Printer size={16} /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* Certificado */}
      <div
        className="w-full max-w-3xl bg-brand-navy text-white rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none print:max-w-full"
        style={{ minHeight: '500px' }}
      >
        {/* Barra de cor do tenant */}
        <div className="h-2" style={{ backgroundColor: corPrimaria }} />

        <div className="px-12 py-10 flex flex-col items-center text-center" style={{ minHeight: '480px' }}>
          {/* Logo Blūmi */}
          <p className="font-display font-bold text-2xl mb-8">
            Blū<span style={{ color: corPrimaria }}>mi</span>
          </p>

          {/* Título */}
          <p className="text-white/60 text-sm uppercase tracking-[0.2em] font-semibold mb-2">
            {organizadorNome}
          </p>
          <h1 className="font-display font-bold text-3xl text-white mb-8">{titulo}</h1>

          {/* Texto */}
          <p className="text-white/70 text-base mb-4">Certificamos que</p>

          <p
            className="font-display font-extrabold text-5xl mb-6 leading-tight"
            style={{ color: corPrimaria }}
          >
            {participanteNome}
          </p>

          <p className="text-white/70 text-base mb-2">participou de</p>
          <p className="font-display font-bold text-2xl text-white mb-6">{eventoNome}</p>

          {/* Datas */}
          {dataFormatada && (
            <p className="text-white/50 text-sm mb-2">{dataFormatada}</p>
          )}

          {/* Carga horária */}
          {cargaHoraria && (
            <p className="text-white/50 text-sm">Carga horária: {cargaHoraria}</p>
          )}

          {/* Linha decorativa */}
          <div className="mt-auto pt-10 w-full">
            <div className="w-24 h-0.5 mx-auto mb-3" style={{ backgroundColor: corPrimaria }} />
            <p className="text-white/40 text-xs">{organizadorNome}</p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="border-t border-white/10 px-12 py-4 flex items-center justify-between">
          <p className="text-white/30 text-xs">Certificado digital — Blūmi Events</p>
          <p className="text-white/30 text-xs font-mono">
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
