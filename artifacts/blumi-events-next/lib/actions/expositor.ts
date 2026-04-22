'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SubeventoDashboard } from '@/lib/supabase/database.types'

export async function gerarLinkExpositor(subeventoId: string, eventoId: string) {
  const supabase = await createClient()

  // Revoga link anterior se existir
  await supabase
    .from('links_expositor')
    .update({ ativo: false })
    .eq('subevento_id', subeventoId)
    .eq('ativo', true)

  const { data, error } = await supabase
    .from('links_expositor')
    .insert({ subevento_id: subeventoId })
    .select('token')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
  return data.token
}

export async function revogarLinkExpositor(linkId: string, eventoId: string) {
  const supabase = await createClient()
  await supabase.from('links_expositor').update({ ativo: false }).eq('id', linkId)
  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function buscarLinkAtivo(subeventoId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('links_expositor')
    .select('id, token, views, created_at')
    .eq('subevento_id', subeventoId)
    .eq('ativo', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function buscarDashboardExpositor(token: string) {
  const supabase = await createServiceClient()

  // Valida token
  const { data: link } = await supabase
    .from('links_expositor')
    .select(`
      id, views,
      subeventos (
        id, nome, modo_inscricao, tipo_tag, local, data_inicio,
        eventos ( id, nome, data_inicio, tenants ( nome, cor_primaria ) )
      )
    `)
    .eq('token', token)
    .eq('ativo', true)
    .single()

  if (!link) return null

  const subevento = link.subeventos as unknown as SubeventoDashboard
  const subeventoId = subevento?.id

  // Incrementa views
  await supabase
    .from('links_expositor')
    .update({ views: (link.views ?? 0) + 1 })
    .eq('id', link.id)

  if (subevento?.modo_inscricao === 'checkin_livre') {
    // Modo B: busca visitas
    const { data: visitas } = await supabase
      .from('visitas_subevento')
      .select(`
        id, created_at,
        inscricoes (
          participantes ( nome, email ),
          respostas_triagem ( pergunta_id, resposta, opcoes,
            perguntas_triagem ( enunciado, tipo )
          )
        )
      `)
      .eq('subevento_id', subeventoId)
      .order('created_at', { ascending: false })

    return { link, subevento, modo: 'B' as const, visitas: visitas ?? [], inscricoes: [] }
  } else {
    // Modo A: busca inscrições no subevento
    const { data: inscricoes } = await supabase
      .from('inscricoes')
      .select(`
        id, created_at, status,
        participantes ( nome, email ),
        tipos_ingresso ( nome ),
        checkins ( id, cancelado, created_at ),
        respostas_triagem ( pergunta_id, resposta, opcoes,
          perguntas_triagem ( enunciado, tipo )
        )
      `)
      .eq('subevento_id', subeventoId)
      .neq('status', 'cancelada')
      .order('created_at', { ascending: false })

    return { link, subevento, modo: 'A' as const, inscricoes: inscricoes ?? [], visitas: [] }
  }
}
