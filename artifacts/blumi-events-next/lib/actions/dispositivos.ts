'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureTenant } from './tenant'
import { revalidatePath } from 'next/cache'

function gerarCodigoSessao(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
}

export async function criarDispositivo(data: {
  eventoId: string
  subeventoId?: string
  nome: string
  tipo: 'fixo' | 'movel'
}) {
  const tenantId = await ensureTenant()
  const supabase = await createClient()

  const codigo = gerarCodigoSessao()
  const expira = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data: dispositivo, error } = await supabase
    .from('dispositivos')
    .insert({
      tenant_id: tenantId,
      evento_id: data.eventoId,
      subevento_id: data.subeventoId ?? null,
      nome: data.nome,
      tipo: data.tipo,
      codigo_sessao: codigo,
      codigo_expira_em: expira,
      ativo: true,
    })
    .select('id, codigo_sessao, codigo_expira_em')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${data.eventoId}`)
  return dispositivo
}

export async function renovarCodigo(dispositivoId: string, eventoId: string) {
  const supabase = await createClient()
  const codigo = gerarCodigoSessao()
  const expira = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('dispositivos')
    .update({ codigo_sessao: codigo, codigo_expira_em: expira })
    .eq('id', dispositivoId)

  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
  return { codigo_sessao: codigo, codigo_expira_em: expira }
}

export async function desativarDispositivo(dispositivoId: string, eventoId: string) {
  const supabase = await createClient()
  await supabase.from('dispositivos').update({ ativo: false }).eq('id', dispositivoId)
  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function resolverCodigoSessao(codigo: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('dispositivos')
    .select(`
      id, nome, tipo, ativo, codigo_expira_em,
      eventos ( id, nome, slug ),
      subeventos ( id, nome, modo_inscricao )
    `)
    .eq('codigo_sessao', codigo)
    .eq('ativo', true)
    .gt('codigo_expira_em', new Date().toISOString())
    .single()

  return data
}
