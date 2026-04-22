'use client'

import { useState, useTransition } from 'react'
import { criarSubevento, atualizarSubevento, deletarSubevento } from '@/lib/actions/subeventos'
import { SubeventoParticipantes } from './subevento-participantes'
import { LinkExpositor } from './link-expositor'
import { Plus, Pencil, Trash2, X, Check, Users, DoorOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Subevento = {
  id: string
  nome: string
  descricao?: string
  modo_inscricao: string
  inscricao_automatica: boolean
  data_inicio?: string
  data_fim?: string
  local?: string
  vagas_total?: number
  tipo_tag?: string
  inscricoes?: any[]
  visitas?: any[]
  link_ativo?: { id: string; token: string; views: number; created_at: string } | null
}

type Props = {
  eventoId: string
  subeventos: Subevento[]
  readonly: boolean
}

const TAGS = ['Workshop', 'Palestra', 'Stand', 'Networking', 'Painel']
const TAG_CORES: Record<string, string> = {
  Workshop:    'bg-pink-100 text-pink-600',
  Palestra:    'bg-blue-100 text-blue-600',
  Stand:       'bg-teal-100 text-teal-600',
  Networking:  'bg-purple-100 text-purple-600',
  Painel:      'bg-orange-100 text-orange-600',
}

export function SubeventosTab({ eventoId, subeventos, readonly }: Props) {
  const [lista, setLista] = useState(subeventos)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [adicionando, setAdicionando] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDeletar(id: string) {
    if (!confirm('Remover subevento?')) return
    setLista((prev) => prev.filter((s) => s.id !== id))
    startTransition(() => deletarSubevento(id, eventoId))
  }

  return (
    <div className="max-w-3xl space-y-3">
      {lista.length === 0 && !adicionando && (
        <div className="text-center py-12 bg-white rounded-card shadow-card">
          <p className="text-2xl mb-2">🏪</p>
          <p className="text-gray-400 text-sm">Nenhum subevento ainda. Adicione stands, workshops e palestras.</p>
        </div>
      )}

      {lista.map((sub) =>
        editandoId === sub.id ? (
          <SubeventoEditor
            key={sub.id}
            initial={sub}
            onSave={async (data) => {
              startTransition(async () => {
                await atualizarSubevento(sub.id, eventoId, data)
                setLista((prev) =>
                  prev.map((s) => s.id === sub.id ? { ...s, ...data } : s)
                )
                setEditandoId(null)
              })
            }}
            onCancel={() => setEditandoId(null)}
          />
        ) : (
          <SubeventoCard
            key={sub.id}
            sub={sub}
            eventoId={eventoId}
            readonly={readonly}
            onEdit={() => setEditandoId(sub.id)}
            onDelete={() => handleDeletar(sub.id)}
          />
        )
      )}

      {adicionando && (
        <SubeventoEditor
          onSave={async (data) => {
            const novo = { id: crypto.randomUUID(), ...data } as Subevento
            setLista((prev) => [...prev, novo])
            setAdicionando(false)
            startTransition(() => criarSubevento(eventoId, data))
          }}
          onCancel={() => setAdicionando(false)}
        />
      )}

      {!readonly && !adicionando && (
        <button
          onClick={() => setAdicionando(true)}
          className="flex items-center gap-2 text-sm text-brand-navy font-medium hover:opacity-70 transition-opacity"
        >
          <Plus size={16} /> Adicionar subevento
        </button>
      )}
    </div>
  )
}

function SubeventoCard({
  sub, eventoId, readonly, onEdit, onDelete,
}: {
  sub: Subevento
  eventoId: string
  readonly: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const [expandido, setExpandido] = useState(false)
  const isModoA = sub.modo_inscricao === 'inscricao'

  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden">
      <div className="px-5 py-4 flex items-start gap-4">
        <div
          className={cn(
            'mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            isModoA ? 'bg-blue-100' : 'bg-teal-100'
          )}
        >
          {isModoA
            ? <Users size={15} className="text-blue-600" />
            : <DoorOpen size={15} className="text-teal-600" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-semibold text-brand-navy text-sm">{sub.nome}</p>
            {sub.tipo_tag && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                TAG_CORES[sub.tipo_tag] ?? 'bg-gray-100 text-gray-500'
              )}>
                {sub.tipo_tag}
              </span>
            )}
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              isModoA ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'
            )}>
              {isModoA ? 'Modo A — Inscrição' : 'Modo B — Entrada livre'}
            </span>
            {sub.inscricao_automatica && (
              <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">
                Auto-inscrição
              </span>
            )}
          </div>

          <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
            {sub.local && <span>📍 {sub.local}</span>}
            {sub.data_inicio && (
              <span>🕐 {new Date(sub.data_inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
            )}
            {sub.vagas_total && <span>🎟 {sub.vagas_total} vagas</span>}
          </div>

          {sub.descricao && (
            <p className="text-xs text-gray-400 mt-1 truncate">{sub.descricao}</p>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setExpandido((v) => !v)}
            className="p-1.5 text-gray-400 hover:text-brand-navy rounded transition-colors"
            title={expandido ? 'Recolher' : 'Ver participantes'}
          >
            {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {!readonly && (
            <>
              <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-brand-navy rounded transition-colors">
                <Pencil size={14} />
              </button>
              <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-status-error rounded transition-colors">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {expandido && (
        <div className="px-5 pb-4">
          <SubeventoParticipantes
            subeventoId={sub.id}
            eventoId={eventoId}
            modo={sub.modo_inscricao as 'inscricao' | 'checkin_livre'}
            inscricoes={sub.inscricoes ?? []}
            visitas={sub.visitas ?? []}
          />
          <LinkExpositor
            subeventoId={sub.id}
            eventoId={eventoId}
            linkAtivo={sub.link_ativo ?? null}
          />
        </div>
      )}
    </div>
  )
}

type EditorProps = {
  initial?: Partial<Subevento>
  onSave: (data: any) => Promise<void>
  onCancel: () => void
}

function SubeventoEditor({ initial, onSave, onCancel }: EditorProps) {
  const [form, setForm] = useState({
    nome: initial?.nome ?? '',
    descricao: initial?.descricao ?? '',
    modo_inscricao: initial?.modo_inscricao ?? 'inscricao',
    inscricao_automatica: initial?.inscricao_automatica ?? false,
    data_inicio: initial?.data_inicio ?? '',
    data_fim: initial?.data_fim ?? '',
    local: initial?.local ?? '',
    vagas_total: initial?.vagas_total ?? '',
    tipo_tag: initial?.tipo_tag ?? '',
  })
  const [saving, setSaving] = useState(false)

  function set(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.nome.trim()) return
    setSaving(true)
    await onSave({
      ...form,
      vagas_total: form.vagas_total ? Number(form.vagas_total) : undefined,
    })
    setSaving(false)
  }

  const inputCls = 'w-full border border-gray-200 rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-brand-navy'

  return (
    <div className="bg-white rounded-card border-2 border-brand-navy/20 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <input
            autoFocus
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
            placeholder="Nome do subevento *"
            className={inputCls}
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Modo de check-in</label>
          <select value={form.modo_inscricao} onChange={(e) => set('modo_inscricao', e.target.value)} className={inputCls}>
            <option value="inscricao">Modo A — Inscrição prévia</option>
            <option value="checkin_livre">Modo B — Entrada livre</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Tag</label>
          <select value={form.tipo_tag} onChange={(e) => set('tipo_tag', e.target.value)} className={inputCls}>
            <option value="">Sem tag</option>
            {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Data início</label>
          <input type="datetime-local" value={form.data_inicio} onChange={(e) => set('data_inicio', e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Data fim</label>
          <input type="datetime-local" value={form.data_fim} onChange={(e) => set('data_fim', e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Local</label>
          <input value={form.local} onChange={(e) => set('local', e.target.value)} placeholder="Ex: Sala 3 / Stand B12" className={inputCls} />
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">Vagas</label>
          <input type="number" min={1} value={form.vagas_total} onChange={(e) => set('vagas_total', e.target.value)} placeholder="Ilimitado" className={inputCls} />
        </div>

        <div className="col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.inscricao_automatica}
              onChange={(e) => set('inscricao_automatica', e.target.checked)}
              className="rounded"
            />
            Inscrição automática ao inscrever no evento pai
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !form.nome.trim()}
          className="flex items-center gap-1.5 bg-brand-lime text-gray-900 font-semibold text-sm px-3 py-1.5 rounded-btn disabled:opacity-50"
        >
          <Check size={14} /> {saving ? 'Salvando…' : 'Salvar'}
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm px-3 py-1.5 rounded-btn">
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}
