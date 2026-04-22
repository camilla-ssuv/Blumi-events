'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SubeventoFormData = {
  nome: string
  descricao?: string
  modo_inscricao: 'inscricao' | 'checkin_livre'
  inscricao_automatica: boolean
  data_inicio?: string
  data_fim?: string
  local?: string
  vagas_total?: number
  tipo_tag?: string
}

export async function criarSubevento(eventoId: string, data: SubeventoFormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('subeventos')
    .insert({ ...data, evento_id: eventoId })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function atualizarSubevento(
  id: string,
  eventoId: string,
  data: Partial<SubeventoFormData>
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('subeventos')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function deletarSubevento(id: string, eventoId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('subeventos')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
}
