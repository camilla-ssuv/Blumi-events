'use client'

import { useState, useTransition } from 'react'
import { criarPergunta, atualizarPergunta, deletarPergunta } from '@/lib/actions/triagem'
import { Plus, Pencil, Trash2, GripVertical, X, Check, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'

type Pergunta = {
  id: string
  enunciado: string
  tipo: string
  opcoes: string[] | null
  obrigatoria: boolean
  ordem: number
  condicao_pergunta_id?: string | null
  condicao_valor?: string | null
}

type Props = {
  eventoId: string
  perguntas: Pergunta[]
  readonly: boolean
}

const TIPO_LABEL: Record<string, string> = {
  texto: 'Texto livre',
  escolha_unica: 'Escolha única',
  multipla_escolha: 'Múltipla escolha',
}

const TIPO_COR: Record<string, string> = {
  texto: 'bg-blue-50 text-blue-600',
  escolha_unica: 'bg-purple-50 text-purple-600',
  multipla_escolha: 'bg-teal-50 text-teal-600',
}

export function TriagemTab({ eventoId, perguntas, readonly }: Props) {
  const [lista, setLista] = useState(perguntas)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [adicionando, setAdicionando] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDeletar(id: string) {
    if (!confirm('Remover pergunta?')) return
    setLista((prev) => prev.filter((p) => p.id !== id))
    startTransition(() => deletarPergunta(id, eventoId))
  }

  function getCondicaoLabel(p: Pergunta): string | null {
    if (!p.condicao_pergunta_id || !p.condicao_valor) return null
    const pergPai = lista.find((l) => l.id === p.condicao_pergunta_id)
    if (!pergPai) return null
    return `Mostrar se "${pergPai.enunciado}" = "${p.condicao_valor}"`
  }

  return (
    <div className="max-w-2xl space-y-3">
      {lista.length === 0 && !adicionando && (
        <div className="text-center py-12 bg-white rounded-card shadow-card">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-gray-400 text-sm">Nenhuma pergunta de triagem ainda.</p>
        </div>
      )}

      {lista.map((pergunta, index) => {
        const condicaoLabel = getCondicaoLabel(pergunta)
        return editandoId === pergunta.id ? (
          <PerguntaEditor
            key={pergunta.id}
            initial={pergunta}
            perguntasAnteriores={lista.filter((_, i) => i < index)}
            onSave={async (data) => {
              startTransition(async () => {
                await atualizarPergunta(pergunta.id, eventoId, data)
                setLista((prev) =>
                  prev.map((p) => p.id === pergunta.id ? { ...p, ...data } : p)
                )
                setEditandoId(null)
              })
            }}
            onCancel={() => setEditandoId(null)}
          />
        ) : (
          <div
            key={pergunta.id}
            className="flex items-start gap-3 bg-white rounded-card shadow-card px-4 py-3"
          >
            <GripVertical size={16} className="text-gray-300 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', TIPO_COR[pergunta.tipo])}>
                  {TIPO_LABEL[pergunta.tipo]}
                </span>
                {pergunta.obrigatoria && (
                  <span className="text-xs text-gray-400">Obrigatória</span>
                )}
                {condicaoLabel && (
                  <span className="flex items-center gap-1 text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                    <GitBranch size={10} /> Condicional
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-800">{pergunta.enunciado}</p>
              {pergunta.opcoes && pergunta.opcoes.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">{pergunta.opcoes.join(' · ')}</p>
              )}
              {condicaoLabel && (
                <p className="text-xs text-purple-400 mt-1 italic">{condicaoLabel}</p>
              )}
            </div>
            {!readonly && (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setEditandoId(pergunta.id)}
                  className="p-1.5 text-gray-400 hover:text-brand-navy rounded transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeletar(pergunta.id)}
                  disabled={pending}
                  className="p-1.5 text-gray-400 hover:text-status-error rounded transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        )
      })}

      {adicionando && (
        <PerguntaEditor
          perguntasAnteriores={lista}
          onSave={async (data) => {
            const nova: Pergunta = {
              id: crypto.randomUUID(),
              ...data,
              tipo: data.tipo ?? 'texto',
              opcoes: data.opcoes ?? null,
              obrigatoria: data.obrigatoria ?? true,
              ordem: lista.length,
            }
            setLista((prev) => [...prev, nova])
            setAdicionando(false)
            startTransition(() =>
              criarPergunta(eventoId, { ...data, ordem: lista.length })
            )
          }}
          onCancel={() => setAdicionando(false)}
        />
      )}

      {!readonly && !adicionando && (
        <button
          onClick={() => setAdicionando(true)}
          className="flex items-center gap-2 text-sm text-brand-navy font-medium hover:opacity-70 transition-opacity"
        >
          <Plus size={16} /> Adicionar pergunta
        </button>
      )}
    </div>
  )
}

type EditorProps = {
  initial?: Partial<Pergunta>
  perguntasAnteriores: Pergunta[]
  onSave: (data: any) => Promise<void>
  onCancel: () => void
}

function PerguntaEditor({ initial, perguntasAnteriores, onSave, onCancel }: EditorProps) {
  const [enunciado, setEnunciado] = useState(initial?.enunciado ?? '')
  const [tipo, setTipo] = useState<string>(initial?.tipo ?? 'texto')
  const [opcoes, setOpcoes] = useState((initial?.opcoes ?? []).join('\n'))
  const [obrigatoria, setObrigatoria] = useState(initial?.obrigatoria ?? true)
  const [condicaoPerguntaId, setCondicaoPerguntaId] = useState(initial?.condicao_pergunta_id ?? '')
  const [condicaoValor, setCondicaoValor] = useState(initial?.condicao_valor ?? '')
  const [saving, setSaving] = useState(false)

  const perguntaPaiSelecionada = perguntasAnteriores.find((p) => p.id === condicaoPerguntaId)
  const opcoesPai = perguntaPaiSelecionada?.opcoes ?? []

  async function handleSave() {
    if (!enunciado.trim()) return
    setSaving(true)
    await onSave({
      enunciado: enunciado.trim(),
      tipo,
      opcoes: tipo !== 'texto' ? opcoes.split('\n').map((o) => o.trim()).filter(Boolean) : undefined,
      obrigatoria,
      condicao_pergunta_id: condicaoPerguntaId || null,
      condicao_valor: condicaoPerguntaId ? (condicaoValor || null) : null,
    })
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-card shadow-card border-2 border-brand-navy/20 p-4 space-y-3">
      <input
        autoFocus
        value={enunciado}
        onChange={(e) => setEnunciado(e.target.value)}
        placeholder="Enunciado da pergunta"
        className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
      />

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
        >
          <option value="texto">Texto livre</option>
          <option value="escolha_unica">Escolha única</option>
          <option value="multipla_escolha">Múltipla escolha</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={obrigatoria}
            onChange={(e) => setObrigatoria(e.target.checked)}
            className="rounded"
          />
          Obrigatória
        </label>
      </div>

      {tipo !== 'texto' && (
        <div>
          <p className="text-xs text-gray-400 mb-1">Opções (uma por linha)</p>
          <textarea
            value={opcoes}
            onChange={(e) => setOpcoes(e.target.value)}
            rows={3}
            placeholder={'Opção 1\nOpção 2\nOpção 3'}
            className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
          />
        </div>
      )}

      {/* Lógica condicional — só aparece se há perguntas anteriores */}
      {perguntasAnteriores.length > 0 && (
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <GitBranch size={12} /> Lógica condicional (opcional)
          </p>
          <select
            value={condicaoPerguntaId}
            onChange={(e) => { setCondicaoPerguntaId(e.target.value); setCondicaoValor('') }}
            className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand-navy text-gray-700"
          >
            <option value="">Mostrar sempre</option>
            {perguntasAnteriores
              .filter((p) => p.tipo !== 'texto')
              .map((p) => (
                <option key={p.id} value={p.id}>{p.enunciado}</option>
              ))}
          </select>

          {condicaoPerguntaId && opcoesPai.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Mostrar quando a resposta for:</p>
              <select
                value={condicaoValor}
                onChange={(e) => setCondicaoValor(e.target.value)}
                className="w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand-navy text-gray-700"
              >
                <option value="">Selecione…</option>
                {opcoesPai.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !enunciado.trim()}
          className="flex items-center gap-1.5 bg-brand-lime text-gray-900 font-semibold text-sm px-3 py-1.5 rounded-btn disabled:opacity-50"
        >
          <Check size={14} /> {saving ? 'Salvando…' : 'Salvar'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm px-3 py-1.5 rounded-btn"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}
