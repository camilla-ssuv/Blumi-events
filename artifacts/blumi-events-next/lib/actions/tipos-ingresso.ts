'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function criarTipoIngresso(
  eventoId: string,
  data: { nome: string; descricao?: string; vagas?: number }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tipos_ingresso')
    .insert({ ...data, evento_id: eventoId })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function deletarTipoIngresso(id: string, eventoId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tipos_ingresso')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
}
