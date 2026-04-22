'use client'

import { useState, useTransition } from 'react'
import { criarTipoIngresso, deletarTipoIngresso } from '@/lib/actions/tipos-ingresso'
import { Plus, Trash2, Ticket } from 'lucide-react'

type TipoIngresso = {
  id: string
  nome: string
  descricao: string | null
  vagas: number | null
}

type Props = {
  eventoId: string
  tipos: TipoIngresso[]
  readonly: boolean
}

export function TiposIngressoTab({ eventoId, tipos, readonly }: Props) {
  const [lista, setLista] = useState(tipos)
  const [adicionando, setAdicionando] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [vagas, setVagas] = useState('')
  const [pending, startTransition] = useTransition()

  function handleAdicionar() {
    if (!nome.trim()) return
    startTransition(async () => {
      await criarTipoIngresso(eventoId, {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        vagas: vagas ? Number(vagas) : undefined,
      })
      setLista((prev) => [...prev, {
        id: crypto.randomUUID(),
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        vagas: vagas ? Number(vagas) : null,
      }])
      setNome(''); setDescricao(''); setVagas('')
      setAdicionando(false)
    })
  }

  function handleDeletar(id: string) {
    if (!confirm('Remover tipo de ingresso?')) return
    setLista((prev) => prev.filter((t) => t.id !== id))
    startTransition(() => deletarTipoIngresso(id, eventoId))
  }

  const inputCls = 'border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand-navy'

  return (
    <div className="max-w-xl space-y-3">
      {lista.length === 0 && !adicionando && (
        <div className="text-center py-10 bg-white rounded-card shadow-card">
          <Ticket size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Nenhum tipo de ingresso. Adicione para segmentar participantes.</p>
        </div>
      )}

      {lista.map((tipo) => (
        <div key={tipo.id} className="flex items-center gap-4 bg-white rounded-card shadow-card px-4 py-3">
          <Ticket size={16} className="text-gray-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 text-sm">{tipo.nome}</p>
            {tipo.descricao && <p className="text-xs text-gray-400 truncate">{tipo.descricao}</p>}
            {tipo.vagas && <p className="text-xs text-gray-400">{tipo.vagas} vagas</p>}
          </div>
          {!readonly && (
            <button
              onClick={() => handleDeletar(tipo.id)}
              disabled={pending}
              className="p-1.5 text-gray-400 hover:text-status-error rounded transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}

      {adicionando && (
        <div className="bg-white rounded-card border-2 border-brand-navy/20 p-4 space-y-3">
          <input
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do tipo (ex: VIP, Geral, Expositor)"
            className={`w-full ${inputCls}`}
          />
          <div className="flex gap-3">
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição (opcional)"
              className={`flex-1 ${inputCls}`}
            />
            <input
              type="number"
              min={1}
              value={vagas}
              onChange={(e) => setVagas(e.target.value)}
              placeholder="Vagas"
              className={`w-24 ${inputCls}`}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdicionar}
              disabled={!nome.trim() || pending}
              className="bg-brand-lime text-gray-900 font-semibold text-sm px-4 py-1.5 rounded-btn disabled:opacity-50"
            >
              {pending ? 'Salvando…' : 'Salvar'}
            </button>
            <button
              onClick={() => setAdicionando(false)}
              className="text-gray-400 text-sm px-3 py-1.5 rounded-btn hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!readonly && !adicionando && (
        <button
          onClick={() => setAdicionando(true)}
          className="flex items-center gap-2 text-sm text-brand-navy font-medium hover:opacity-70 transition-opacity"
        >
          <Plus size={16} /> Adicionar tipo de ingresso
        </button>
      )}
    </div>
  )
}
