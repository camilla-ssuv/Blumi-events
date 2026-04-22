'use server'

import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export type RespostaTriagem = {
  pergunta_id: string
  resposta?: string
  opcoes?: string[]
}

export type InscricaoInput = {
  evento_id: string
  subevento_id?: string
  tipo_ingresso_id?: string
  codigo_convite?: string
  respostas: RespostaTriagem[]
}

export async function inscrever(input: InscricaoInput) {
  const session = await getServerSession()
  if (!session) throw new Error('Faça login para se inscrever')

  const { user_id, name, email } = session.user
  const supabase = await createClient()

  // Valida código de convite no servidor (não confiar apenas no cliente)
  const { data: evento } = await supabase
    .from('eventos')
    .select('visibilidade, codigo_convite')
    .eq('id', input.evento_id)
    .single()

  if (!evento) throw new Error('Evento não encontrado')

  if (evento.visibilidade === 'convite') {
    if (!input.codigo_convite?.trim()) throw new Error('Este evento é por convite. Informe o código de acesso.')
    if (input.codigo_convite.trim().toUpperCase() !== (evento.codigo_convite ?? '').toUpperCase()) {
      throw new Error('Código de convite inválido.')
    }
  }

  // Garante que o participante existe no Supabase Events
  await supabase.from('participantes').upsert({
    id: user_id,
    nome: name || email,
    email,
  }, { onConflict: 'id' })

  // Cria inscrição
  const { data: inscricao, error: errInscricao } = await supabase
    .from('inscricoes')
    .insert({
      participante_id: user_id,
      evento_id: input.evento_id,
      subevento_id: input.subevento_id ?? null,
      tipo_ingresso_id: input.tipo_ingresso_id ?? null,
    })
    .select('id')
    .single()

  if (errInscricao) {
    if (errInscricao.code === '23505') throw new Error('Você já está inscrito neste evento')
    throw new Error(errInscricao.message)
  }

  // Salva respostas de triagem
  if (input.respostas.length > 0) {
    const { error: errRespostas } = await supabase
      .from('respostas_triagem')
      .insert(
        input.respostas.map((r) => ({
          inscricao_id: inscricao.id,
          pergunta_id: r.pergunta_id,
          resposta: r.resposta ?? null,
          opcoes: r.opcoes ?? null,
        }))
      )
    if (errRespostas) throw new Error(errRespostas.message)
  }

  // Subeventos com inscricao_automatica
  const { data: subsAuto } = await supabase
    .from('subeventos')
    .select('id')
    .eq('evento_id', input.evento_id)
    .eq('inscricao_automatica', true)

  if (subsAuto && subsAuto.length > 0) {
    await supabase.from('inscricoes').insert(
      subsAuto.map((s) => ({
        participante_id: user_id,
        evento_id: input.evento_id,
        subevento_id: s.id,
      }))
    )
  }

  revalidatePath('/minha-area')
  return { inscricao_id: inscricao.id }
}

export async function verificarInscricao(eventoId: string): Promise<boolean> {
  const session = await getServerSession()
  if (!session) return false

  const supabase = await createClient()
  const { data } = await supabase
    .from('inscricoes')
    .select('id')
    .eq('evento_id', eventoId)
    .eq('participante_id', session.user.user_id)
    .is('subevento_id', null)
    .single()

  return !!data
}
