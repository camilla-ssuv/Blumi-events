'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PerguntaFormData = {
  enunciado: string
  tipo: 'texto' | 'escolha_unica' | 'multipla_escolha'
  opcoes?: string[]
  obrigatoria: boolean
  ordem: number
  condicao_pergunta_id?: string | null
  condicao_valor?: string | null
}

export async function criarPergunta(eventoId: string, data: PerguntaFormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('perguntas_triagem')
    .insert({ ...data, evento_id: eventoId, opcoes: data.opcoes ?? null })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function atualizarPergunta(
  id: string,
  eventoId: string,
  data: Partial<PerguntaFormData>
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('perguntas_triagem')
    .update(data)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function deletarPergunta(id: string, eventoId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('perguntas_triagem')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function reordenarPerguntas(
  eventoId: string,
  ordens: { id: string; ordem: number }[]
) {
  const supabase = await createClient()
  await Promise.all(
    ordens.map(({ id, ordem }) =>
      supabase.from('perguntas_triagem').update({ ordem }).eq('id', id)
    )
  )
  revalidatePath(`/admin/eventos/${eventoId}`)
}
