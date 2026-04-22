'use client'

import { useState, useTransition } from 'react'
import { criarEvento, atualizarEvento, type EventoFormData } from '@/lib/actions/eventos'
import { cn } from '@/lib/utils'

type Props = {
  eventoId?: string
  inicial?: Partial<EventoFormData>
}

export function EventoForm({ eventoId, inicial }: Props) {
  const [form, setForm] = useState<EventoFormData>({
    nome: inicial?.nome ?? '',
    descricao: inicial?.descricao ?? '',
    tipo: inicial?.tipo ?? 'simples',
    visibilidade: inicial?.visibilidade ?? 'aberto',
    codigo_convite: inicial?.codigo_convite ?? '',
    data_inicio: inicial?.data_inicio ?? '',
    data_fim: inicial?.data_fim ?? '',
    cidade: inicial?.cidade ?? '',
    endereco: inicial?.endereco ?? '',
    vagas_total: inicial?.vagas_total,
  })
  const [erro, setErro] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function set<K extends keyof EventoFormData>(key: K, value: EventoFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    startTransition(async () => {
      try {
        if (eventoId) {
          await atualizarEvento(eventoId, form)
        } else {
          await criarEvento(form)
        }
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao salvar')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Nome do evento *">
        <input
          required
          value={form.nome}
          onChange={(e) => set('nome', e.target.value)}
          placeholder="Ex: Feira de Carreiras Itaú 2025"
          className={inputCls}
        />
      </Field>

      <Field label="Descrição">
        <textarea
          value={form.descricao}
          onChange={(e) => set('descricao', e.target.value)}
          rows={3}
          placeholder="Descreva o evento para os participantes"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Tipo *">
          <select
            value={form.tipo}
            onChange={(e) => set('tipo', e.target.value as EventoFormData['tipo'])}
            className={inputCls}
          >
            <option value="simples">Simples (palestra/workshop)</option>
            <option value="feira">Feira (com stands/subeventos)</option>
          </select>
        </Field>

        <Field label="Visibilidade *">
          <select
            value={form.visibilidade}
            onChange={(e) => set('visibilidade', e.target.value as EventoFormData['visibilidade'])}
            className={inputCls}
          >
            <option value="aberto">Aberto (catálogo público)</option>
            <option value="convite">Por convite (código)</option>
          </select>
        </Field>
      </div>

      {form.visibilidade === 'convite' && (
        <Field label="Código de convite">
          <input
            value={form.codigo_convite}
            onChange={(e) => set('codigo_convite', e.target.value)}
            placeholder="Ex: NUBANK2025"
            className={inputCls}
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Data de início">
          <input
            type="datetime-local"
            value={form.data_inicio}
            onChange={(e) => set('data_inicio', e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Data de fim">
          <input
            type="datetime-local"
            value={form.data_fim}
            onChange={(e) => set('data_fim', e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Cidade">
          <input
            value={form.cidade}
            onChange={(e) => set('cidade', e.target.value)}
            placeholder="São Paulo"
            className={inputCls}
          />
        </Field>
        <Field label="Vagas totais">
          <input
            type="number"
            min={1}
            value={form.vagas_total ?? ''}
            onChange={(e) => set('vagas_total', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Ex: 500"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Endereço">
        <input
          value={form.endereco}
          onChange={(e) => set('endereco', e.target.value)}
          placeholder="Rua, número, bairro"
          className={inputCls}
        />
      </Field>

      {erro && (
        <p className="text-status-error text-sm bg-red-50 border border-red-100 rounded-btn px-4 py-2">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-brand-lime text-gray-900 font-semibold px-6 py-2.5 rounded-btn hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {pending ? 'Salvando…' : eventoId ? 'Salvar alterações' : 'Criar evento'}
        </button>
        <a href="/admin/eventos" className="text-sm text-gray-400 hover:text-gray-600">
          Cancelar
        </a>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}

const inputCls = cn(
  'w-full border border-gray-200 rounded-btn px-3 py-2.5 text-sm text-gray-900',
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy',
  'bg-white transition-colors'
)
