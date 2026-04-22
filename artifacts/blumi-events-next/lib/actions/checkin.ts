'use server'

import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import type { InscricaoOffline } from '@/lib/checkin-offline'
import type { InscricaoCheckinRow } from '@/lib/supabase/database.types'

export type CheckinResultado = {
  ok: boolean
  tipo: 'sucesso' | 'ja_feito' | 'invalido' | 'cancelado' | 'erro'
  mensagem: string
  participante?: { nome: string; email: string }
  evento?: string
  subevento?: string
}

export async function realizarCheckin(
  qrToken: string,
  origem: 'camera' | 'usb' | 'manual',
  dispositivoId?: string
): Promise<CheckinResultado> {
  const supabase = await createClient()

  const { data: inscricao, error } = await supabase
    .from('inscricoes')
    .select(`
      id, status, evento_id,
      participantes ( nome, email ),
      eventos ( nome ),
      subeventos ( nome ),
      checkins ( id, cancelado )
    `)
    .eq('qr_token', qrToken)
    .single()

  if (error || !inscricao) {
    return { ok: false, tipo: 'invalido', mensagem: 'QR Code não encontrado' }
  }

  const insc = inscricao as unknown as InscricaoCheckinRow

  if (insc.status === 'cancelada') {
    return { ok: false, tipo: 'cancelado', mensagem: 'Inscrição cancelada' }
  }

  const checkinExistente = insc.checkins?.find((c) => !c.cancelado)
  if (checkinExistente) {
    return {
      ok: false,
      tipo: 'ja_feito',
      mensagem: 'Check-in já realizado',
      participante: insc.participantes ?? undefined,
      evento: insc.eventos?.nome,
      subevento: insc.subeventos?.nome,
    }
  }

  const { error: errCheckin } = await supabase
    .from('checkins')
    .insert({
      inscricao_id: insc.id,
      origem,
      dispositivo_id: dispositivoId ?? null,
      cancelado: false,
    })

  if (errCheckin) {
    if (errCheckin.code === '23505') {
      return { ok: false, tipo: 'ja_feito', mensagem: 'Check-in já realizado (concorrente)' }
    }
    return { ok: false, tipo: 'erro', mensagem: errCheckin.message }
  }

  revalidatePath(`/admin/eventos/${insc.evento_id}`)

  return {
    ok: true,
    tipo: 'sucesso',
    mensagem: 'Check-in realizado!',
    participante: insc.participantes ?? undefined,
    evento: insc.eventos?.nome,
    subevento: insc.subeventos?.nome,
  }
}

export async function realizarCheckinModoB(
  qrToken: string,
  subeventoId: string,
  dispositivoId?: string
): Promise<CheckinResultado> {
  const supabase = await createClient()

  const { data: inscricao, error } = await supabase
    .from('inscricoes')
    .select(`
      id, status, evento_id,
      participantes ( nome, email ),
      eventos ( nome ),
      subeventos ( nome )
    `)
    .eq('qr_token', qrToken)
    .is('subevento_id', null)
    .single()

  if (error || !inscricao) {
    return { ok: false, tipo: 'invalido', mensagem: 'QR Code não encontrado' }
  }

  const insc = inscricao as unknown as InscricaoCheckinRow

  if (insc.status === 'cancelada') {
    return { ok: false, tipo: 'cancelado', mensagem: 'Inscrição cancelada' }
  }

  await supabase.from('visitas_subevento').insert({
    subevento_id: subeventoId,
    inscricao_id: insc.id,
    dispositivo_id: dispositivoId ?? null,
  })

  return {
    ok: true,
    tipo: 'sucesso',
    mensagem: 'Bem-vindo ao stand!',
    participante: insc.participantes ?? undefined,
    evento: insc.eventos?.nome,
  }
}

export async function buscarPorNomeOuEmail(
  eventoId: string,
  termo: string
) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('inscricoes')
    .select(`
      id, qr_token, status,
      participantes ( nome, email ),
      checkins ( id, cancelado )
    `)
    .eq('evento_id', eventoId)
    .is('subevento_id', null)
    .or(`participantes.nome.ilike.%${termo}%,participantes.email.ilike.%${termo}%`)
    .limit(10)

  return data ?? []
}

export async function cancelarCheckin(
  checkinId: string,
  inscricaoId: string,
  motivo: string
) {
  const supabase = await createClient()
  const session = await getServerSession()
  const operadorId = session?.user.user_id ?? 'sistema'

  // Busca evento_id para revalidar o path correto
  const { data: inscricao } = await supabase
    .from('inscricoes')
    .select('evento_id')
    .eq('id', inscricaoId)
    .single()

  await supabase
    .from('checkins')
    .update({
      cancelado: true,
      cancelado_por: operadorId,
      cancelado_em: new Date().toISOString(),
      motivo_cancel: motivo,
    })
    .eq('id', checkinId)

  // Partial unique index (WHERE cancelado=false) permite este insert após o UPDATE acima
  const { error } = await supabase.from('checkins').insert({
    inscricao_id: inscricaoId,
    origem: 'correcao_admin',
    cancelado: false,
  })

  if (error) throw new Error(error.message)

  if (inscricao?.evento_id) {
    revalidatePath(`/admin/eventos/${inscricao.evento_id}`)
  }
}

export async function buscarInscricoesParaOffline(eventoId: string): Promise<InscricaoOffline[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('inscricoes')
    .select(`
      qr_token, evento_id, status,
      participantes ( nome, email ),
      checkins ( id, cancelado )
    `)
    .eq('evento_id', eventoId)
    .is('subevento_id', null)
    .neq('status', 'cancelada')

  type OfflineRow = {
    qr_token: string
    evento_id: string
    status: string
    participantes: { nome: string; email: string } | null
    checkins: { id: string; cancelado: boolean }[]
  }
  return (data ?? []).map((i) => {
    const row = i as unknown as OfflineRow
    return {
      qr_token: row.qr_token,
      participante_nome: row.participantes?.nome ?? '',
      participante_email: row.participantes?.email ?? '',
      checkin_feito: (row.checkins ?? []).some((c) => !c.cancelado),
      evento_id: row.evento_id,
    }
  })
}
