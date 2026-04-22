'use client'

import { useState, useTransition } from 'react'
import { criarDispositivo, renovarCodigo, desativarDispositivo } from '@/lib/actions/dispositivos'
import { Smartphone, Monitor, Plus, RefreshCw, XCircle, Copy, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

type Subevento = { id: string; nome: string }

type Dispositivo = {
  id: string
  nome: string
  tipo: string
  ativo: boolean
  codigo_sessao: string
  codigo_expira_em: string
  subeventos: { nome: string } | null
}

type Props = {
  eventoId: string
  dispositivos: Dispositivo[]
  subeventos: Subevento[]
}

export function DispositivosTab({ eventoId, dispositivos: inicial, subeventos }: Props) {
  const [lista, setLista] = useState(inicial)
  const [adicionando, setAdicionando] = useState(false)
  const [form, setForm] = useState({ nome: '', tipo: 'movel' as const, subeventoId: '' })
  const [copiado, setCopiado] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleCriar() {
    if (!form.nome.trim()) return
    startTransition(async () => {
      const novo = await criarDispositivo({
        eventoId,
        nome: form.nome.trim(),
        tipo: form.tipo,
        subeventoId: form.subeventoId || undefined,
      })
      setLista((prev) => [...prev, {
        id: novo.id,
        nome: form.nome.trim(),
        tipo: form.tipo,
        ativo: true,
        codigo_sessao: novo.codigo_sessao,
        codigo_expira_em: novo.codigo_expira_em,
        subeventos: subeventos.find((s) => s.id === form.subeventoId) ? { nome: subeventos.find((s) => s.id === form.subeventoId)!.nome } : null,
      }])
      setForm({ nome: '', tipo: 'movel', subeventoId: '' })
      setAdicionando(false)
    })
  }

  function handleRenovar(id: string) {
    startTransition(async () => {
      const res = await renovarCodigo(id, eventoId)
      setLista((prev) => prev.map((d) =>
        d.id === id ? { ...d, codigo_sessao: res.codigo_sessao, codigo_expira_em: res.codigo_expira_em } : d
      ))
    })
  }

  function handleDesativar(id: string) {
    if (!confirm('Desativar este dispositivo?')) return
    startTransition(async () => {
      await desativarDispositivo(id, eventoId)
      setLista((prev) => prev.map((d) => d.id === id ? { ...d, ativo: false } : d))
    })
  }

  function copiar(codigo: string) {
    navigator.clipboard.writeText(codigo)
    setCopiado(codigo)
    setTimeout(() => setCopiado(null), 2000)
  }

  const ativos = lista.filter((d) => d.ativo)
  const inativos = lista.filter((d) => !d.ativo)

  const inputCls = 'border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand-navy'

  return (
    <div className="max-w-2xl space-y-4">
      {ativos.length === 0 && !adicionando && (
        <div className="text-center py-10 bg-white rounded-card shadow-card">
          <Smartphone size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Nenhum dispositivo ativo. Crie um para gerar o código de sessão.</p>
        </div>
      )}

      {ativos.map((d) => {
        const expirado = new Date(d.codigo_expira_em) < new Date()
        return (
          <div key={d.id} className="bg-white rounded-card shadow-card p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                {d.tipo === 'fixo'
                  ? <Monitor size={16} className="text-brand-navy" />
                  : <Smartphone size={16} className="text-brand-navy" />}
                <div>
                  <p className="font-semibold text-brand-navy text-sm">{d.nome}</p>
                  <p className="text-xs text-gray-400">
                    {d.tipo === 'fixo' ? 'Fixo' : 'Móvel'}
                    {d.subeventos && ` · ${d.subeventos.nome}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleRenovar(d.id)}
                  disabled={pending}
                  title="Renovar código"
                  className="p-1.5 text-gray-400 hover:text-brand-navy rounded transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => handleDesativar(d.id)}
                  disabled={pending}
                  title="Desativar"
                  className="p-1.5 text-gray-400 hover:text-status-error rounded transition-colors"
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>

            {/* Código de sessão */}
            <div className={cn(
              'flex items-center justify-between gap-3 rounded-btn px-4 py-3',
              expirado ? 'bg-red-50 border border-red-100' : 'bg-gray-50'
            )}>
              <div>
                <p className="font-mono text-3xl font-bold tracking-[0.3em] text-brand-navy">
                  {d.codigo_sessao}
                </p>
                <p className={cn('text-xs mt-0.5', expirado ? 'text-status-error' : 'text-gray-400')}>
                  {expirado
                    ? 'Código expirado — renove'
                    : `Válido até ${new Date(d.codigo_expira_em).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copiar(d.codigo_sessao)}
                  className="p-2 text-gray-400 hover:text-brand-navy rounded transition-colors"
                  title="Copiar código"
                >
                  {copiado === d.codigo_sessao ? <Check size={15} className="text-status-success" /> : <Copy size={15} />}
                </button>
                <a
                  href={`/checkin?codigo=${d.codigo_sessao}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-brand-navy rounded transition-colors"
                  title="Abrir terminal"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </div>
        )
      })}

      {adicionando && (
        <div className="bg-white rounded-card border-2 border-brand-navy/20 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input
                autoFocus
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                placeholder="Nome do dispositivo (ex: Leitor 01, Entrada Principal)"
                className={`w-full ${inputCls}`}
              />
            </div>
            <select
              value={form.tipo}
              onChange={(e) => setForm((p: any) => ({ ...p, tipo: e.target.value as 'fixo' | 'movel' }))}
              className={inputCls}
            >
              <option value="movel">Móvel (celular/tablet)</option>
              <option value="fixo">Fixo (totem/notebook)</option>
            </select>
            {subeventos.length > 0 && (
              <select
                value={form.subeventoId}
                onChange={(e) => setForm((p) => ({ ...p, subeventoId: e.target.value }))}
                className={inputCls}
              >
                <option value="">Evento pai (geral)</option>
                {subeventos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCriar}
              disabled={!form.nome.trim() || pending}
              className="bg-brand-lime text-gray-900 font-semibold text-sm px-4 py-1.5 rounded-btn disabled:opacity-50"
            >
              {pending ? 'Criando…' : 'Criar dispositivo'}
            </button>
            <button onClick={() => setAdicionando(false)} className="text-gray-400 text-sm px-3 rounded-btn hover:text-gray-700">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!adicionando && (
        <button
          onClick={() => setAdicionando(true)}
          className="flex items-center gap-2 text-sm text-brand-navy font-medium hover:opacity-70 transition-opacity"
        >
          <Plus size={16} /> Adicionar dispositivo
        </button>
      )}

      {inativos.length > 0 && (
        <p className="text-xs text-gray-400">{inativos.length} dispositivo{inativos.length !== 1 ? 's' : ''} inativo{inativos.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
