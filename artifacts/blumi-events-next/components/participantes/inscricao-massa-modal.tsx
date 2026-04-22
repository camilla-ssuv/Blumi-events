'use client'

import { useState, useTransition } from 'react'
import { inscreverEmMassa, type ResultadoMassa } from '@/lib/actions/inscricao-massa'
import { X, Upload, CheckCircle2, AlertCircle, RefreshCw, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  eventoId: string
  onClose: () => void
}

type Etapa = 'input' | 'processando' | 'resultado'

export function InscricaoMassaModal({ eventoId, onClose }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('input')
  const [textoEmails, setTextoEmails] = useState('')
  const [resultados, setResultados] = useState<ResultadoMassa[]>([])
  const [pending, startTransition] = useTransition()

  function emailsValidos(): string[] {
    return textoEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes('@'))
  }

  function handleProcessar() {
    const emails = emailsValidos()
    if (emails.length === 0) return
    setEtapa('processando')
    startTransition(async () => {
      const res = await inscreverEmMassa(eventoId, emails)
      setResultados(res)
      setEtapa('resultado')
    })
  }

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const texto = ev.target?.result as string
      // Extrai e-mails de CSV — assume email em qualquer coluna
      const emails = texto
        .split(/[\n\r]+/)
        .flatMap((linha) => linha.split(','))
        .map((cel) => cel.replace(/"/g, '').trim().toLowerCase())
        .filter((s) => s.includes('@'))
      setTextoEmails((prev) => [...new Set([...prev.split(/[\n,;]+/).map((e) => e.trim()), ...emails])].join('\n'))
    }
    reader.readAsText(file)
  }

  const resumo = {
    inscritos:     resultados.filter((r) => r.status === 'inscrito').length,
    ja_inscritos:  resultados.filter((r) => r.status === 'ja_inscrito').length,
    contas_criadas: resultados.filter((r) => r.status === 'conta_criada').length,
    erros:         resultados.filter((r) => r.status === 'erro').length,
  }

  const STATUS_CONFIG: Record<ResultadoMassa['status'], { label: string; icon: React.ReactNode; cls: string }> = {
    inscrito:      { label: 'Inscrito',        icon: <CheckCircle2 size={13} />, cls: 'text-status-success' },
    ja_inscrito:   { label: 'Já inscrito',     icon: <UserCheck size={13} />,    cls: 'text-gray-400' },
    conta_criada:  { label: 'Conta criada',    icon: <CheckCircle2 size={13} />, cls: 'text-blue-500' },
    erro:          { label: 'Erro',            icon: <AlertCircle size={13} />,  cls: 'text-status-error' },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={etapa !== 'processando' ? onClose : undefined} />

      <div className="relative bg-white rounded-card shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-display font-bold text-brand-navy text-lg">Inscrição em massa</h2>
            <p className="text-xs text-gray-400">Cole e-mails ou importe um CSV</p>
          </div>
          {etapa !== 'processando' && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-btn">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Etapa 1: Input */}
          {etapa === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-mails (um por linha, ou separados por vírgula/ponto e vírgula)
                </label>
                <textarea
                  autoFocus
                  value={textoEmails}
                  onChange={(e) => setTextoEmails(e.target.value)}
                  rows={8}
                  placeholder={'joao@empresa.com\nmaria@empresa.com\npedro@empresa.com'}
                  className="w-full border border-gray-200 rounded-btn px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-brand-navy resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {emailsValidos().length} e-mail{emailsValidos().length !== 1 ? 's' : ''} válido{emailsValidos().length !== 1 ? 's' : ''} detectado{emailsValidos().length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-btn px-3 py-2 text-sm text-gray-600 hover:border-brand-navy transition-colors">
                  <Upload size={14} />
                  Importar CSV
                  <input type="file" accept=".csv,.txt" onChange={handleArquivo} className="hidden" />
                </label>
                <span className="text-xs text-gray-400">
                  Aceita .csv com e-mails em qualquer coluna
                </span>
              </div>

              <button
                onClick={handleProcessar}
                disabled={emailsValidos().length === 0}
                className="w-full bg-brand-lime text-gray-900 font-bold py-3 rounded-btn hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Inscrever {emailsValidos().length > 0 ? emailsValidos().length : ''} participante{emailsValidos().length !== 1 ? 's' : ''}
              </button>
            </div>
          )}

          {/* Processando */}
          {etapa === 'processando' && (
            <div className="text-center py-12 space-y-4">
              <RefreshCw size={32} className="text-brand-navy animate-spin mx-auto" />
              <div>
                <h3 className="font-display font-bold text-brand-navy">Processando inscrições…</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Isso pode levar alguns segundos para listas grandes.
                </p>
              </div>
            </div>
          )}

          {/* Resultado */}
          {etapa === 'resultado' && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Inscritos', valor: resumo.inscritos, cor: 'text-status-success' },
                  { label: 'Contas criadas', valor: resumo.contas_criadas, cor: 'text-blue-500' },
                  { label: 'Já inscritos', valor: resumo.ja_inscritos, cor: 'text-gray-400' },
                  { label: 'Erros', valor: resumo.erros, cor: 'text-status-error' },
                ].map(({ label, valor, cor }) => (
                  <div key={label} className="bg-gray-50 rounded-btn px-4 py-3 text-center">
                    <p className={cn('font-display font-bold text-2xl', cor)}>{valor}</p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              {/* Lista detalhada */}
              <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-btn divide-y divide-gray-50">
                {resultados.map((r) => {
                  const cfg = STATUS_CONFIG[r.status]
                  return (
                    <div key={r.email} className="flex items-center justify-between px-3 py-2.5 gap-3">
                      <span className="text-sm text-gray-700 truncate font-mono text-xs">{r.email}</span>
                      <span className={cn('flex items-center gap-1 text-xs font-medium shrink-0', cfg.cls)}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>

              {resumo.contas_criadas > 0 && (
                <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-btn px-3 py-2">
                  {resumo.contas_criadas} nova{resumo.contas_criadas !== 1 ? 's conta foram criadas' : ' conta foi criada'} na Blūmi.
                  Os participantes receberão e-mail de boas-vindas.
                </p>
              )}

              <button
                onClick={onClose}
                className="w-full bg-brand-navy text-white font-semibold py-2.5 rounded-btn hover:opacity-90 transition-opacity"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
