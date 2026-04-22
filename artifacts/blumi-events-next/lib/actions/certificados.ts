'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function configurarCertificado(
  eventoId: string,
  config: {
    emitir_certificados: boolean
    certificado_titulo?: string
    certificado_carga_horaria?: string
  }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('eventos')
    .update(config)
    .eq('id', eventoId)
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function buscarCertificado(qrToken: string) {
  const supabase = await createServiceClient()

  const { data: inscricao } = await supabase
    .from('inscricoes')
    .select(`
      id, qr_token,
      participantes ( nome, email ),
      eventos (
        id, nome, data_inicio, data_fim, cidade,
        emitir_certificados, certificado_titulo, certificado_carga_horaria,
        tenants ( nome, cor_primaria )
      ),
      checkins ( id, cancelado, created_at )
    `)
    .eq('qr_token', qrToken)
    .single()

  return inscricao
}
