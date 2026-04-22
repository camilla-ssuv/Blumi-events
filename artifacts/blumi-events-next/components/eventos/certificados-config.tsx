'use client'

import { useState, useTransition } from 'react'
import { configurarCertificado } from '@/lib/actions/certificados'
import { Award, ExternalLink, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  eventoId: string
  emitir: boolean
  titulo: string
  cargaHoraria: string
  encerrado: boolean
}

export function CertificadosConfig({ eventoId, emitir: emitirInicial, titulo: tituloInicial, cargaHoraria: chInicial, encerrado }: Props) {
  const [emitir, setEmitir] = useState(emitirInicial)
  const [titulo, setTitulo] = useState(tituloInicial)
  const [cargaHoraria, setCargaHoraria] = useState(chInicial)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSalvar() {
    startTransition(async () => {
      await configurarCertificado(eventoId, {
        emitir_certificados: emitir,
        certificado_titulo: titulo,
        certificado_carga_horaria: cargaHoraria || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const inputCls = 'w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand-navy disabled:bg-gray-50 disabled:text-gray-400'

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white rounded-card shadow-card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-btn bg-brand-lime/20 flex items-center justify-center">
            <Award size={18} className="text-brand-navy" />
          </div>
          <div>
            <h3 className="font-display font-bold text-brand-navy">Certificados de participação</h3>
            <p className="text-xs text-gray-400">Participantes com check-in válido poderão acessar seu certificado</p>
          </div>
        </div>

        {/* Toggle emitir */}
        <label className="flex items-center justify-between cursor-pointer py-3 border-y border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Emitir certificados</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {emitir ? 'Certificados disponíveis para participantes presentes' : 'Certificados desativados'}
            </p>
          </div>
          <button
            role="switch"
            aria-checked={emitir}
            onClick={() => !encerrado && setEmitir(!emitir)}
            disabled={encerrado}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors focus:outline-none',
              emitir ? 'bg-brand-navy' : 'bg-gray-200',
              encerrado && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              emitir && 'translate-x-5'
            )} />
          </button>
        </label>

        {/* Título do certificado */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Título do certificado</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={encerrado}
            placeholder="Certificado de Participação"
            className={inputCls}
          />
        </div>

        {/* Carga horária */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Carga horária (opcional)</label>
          <input
            value={cargaHoraria}
            onChange={(e) => setCargaHoraria(e.target.value)}
            disabled={encerrado}
            placeholder="Ex: 8 horas"
            className={inputCls}
          />
        </div>

        {!encerrado && (
          <button
            onClick={handleSalvar}
            disabled={pending}
            className="flex items-center gap-1.5 bg-brand-lime text-gray-900 font-semibold text-sm px-4 py-2 rounded-btn hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saved ? <><Check size={14} /> Salvo!</> : pending ? 'Salvando…' : 'Salvar configurações'}
          </button>
        )}
      </div>

      {/* Pré-visualização do link */}
      {emitir && (
        <div className="bg-brand-navy/5 border border-brand-navy/20 rounded-card p-4 space-y-2">
          <p className="text-xs font-semibold text-brand-navy uppercase tracking-wider">Como funciona</p>
          <p className="text-sm text-gray-600">
            Cada participante com check-in válido receberá um link único em <strong>Minha Área</strong> para acessar e imprimir seu certificado.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-btn px-3 py-2 font-mono">
            <ExternalLink size={11} />
            /certificado/[qr_token]
          </div>
        </div>
      )}
    </div>
  )
}
