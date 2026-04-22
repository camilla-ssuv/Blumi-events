'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureTenant } from './tenant'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type EventoFormData = {
  nome: string
  descricao?: string
  tipo: 'simples' | 'feira'
  visibilidade: 'aberto' | 'convite'
  codigo_convite?: string
  data_inicio?: string
  data_fim?: string
  cidade?: string
  endereco?: string
  vagas_total?: number
}

function gerarSlug(nome: string): string {
  const base = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return `${base}-${Date.now().toString(36)}`
}

export async function criarEvento(data: EventoFormData) {
  const tenantId = await ensureTenant()
  const supabase = await createClient()

  const slug = gerarSlug(data.nome)

  const { data: evento, error } = await supabase
    .from('eventos')
    .insert({ ...data, tenant_id: tenantId, status: 'rascunho', slug })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  redirect(`/admin/eventos/${evento.id}`)
}

export async function atualizarEvento(
  id: string,
  data: Partial<EventoFormData>
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('eventos')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .neq('status', 'encerrado')

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${id}`)
}

export async function publicarEvento(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('eventos')
    .update({ status: 'publicado', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'rascunho')

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${id}`)
}

export async function encerrarEvento(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('eventos')
    .update({ status: 'encerrado', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'publicado')

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${id}`)
}
