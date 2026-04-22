'use server'

import { createClient } from '@/lib/supabase/server'
import { createPrincipalServiceClient } from '@/lib/supabase/principal'
import { getServerSession } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export type ResultadoMassa = {
  email: string
  status: 'inscrito' | 'ja_inscrito' | 'conta_criada' | 'erro'
  detalhe?: string
}

export async function inscreverEmMassa(
  eventoId: string,
  emails: string[],
  tipoIngressoId?: string
): Promise<ResultadoMassa[]> {
  const session = await getServerSession()
  if (!session) throw new Error('Não autenticado')

  const supabase = await createClient()
  const principalService = createPrincipalServiceClient()

  const resultados: ResultadoMassa[] = []

  for (const emailRaw of emails) {
    const email = emailRaw.trim().toLowerCase()
    if (!email || !email.includes('@')) continue

    try {
      // Busca usuário no Principal pelo email
      const { data: users } = await principalService.auth.admin.listUsers()
      const usuarioPrincipal = users?.users?.find((u: any) => u.email === email)

      let participanteId: string

      if (usuarioPrincipal) {
        participanteId = usuarioPrincipal.id

        // Upsert participante no Supabase Events
        await supabase.from('participantes').upsert({
          id: participanteId,
          nome: usuarioPrincipal.user_metadata?.full_name ?? email.split('@')[0],
          email,
        }, { onConflict: 'id' })
      } else {
        // Cria conta no Principal — vira lead Blūmi
        const { data: novoUsuario, error: errCriacao } = await principalService.auth.admin.createUser({
          email,
          email_confirm: false,
          user_metadata: { origem: 'inscricao_massa', evento_id: eventoId },
        })

        if (errCriacao || !novoUsuario?.user) {
          resultados.push({ email, status: 'erro', detalhe: errCriacao?.message })
          continue
        }

        participanteId = novoUsuario.user.id
        await supabase.from('participantes').upsert({
          id: participanteId,
          nome: email.split('@')[0],
          email,
        }, { onConflict: 'id' })

        resultados.push({ email, status: 'conta_criada' })
        // Continua para criar a inscrição abaixo
      }

      // Cria inscrição
      const { error: errInscricao } = await supabase
        .from('inscricoes')
        .insert({
          participante_id: participanteId,
          evento_id: eventoId,
          tipo_ingresso_id: tipoIngressoId ?? null,
        })

      if (errInscricao) {
        if (errInscricao.code === '23505') {
          resultados.push({ email, status: 'ja_inscrito' })
        } else {
          resultados.push({ email, status: 'erro', detalhe: errInscricao.message })
        }
        continue
      }

      if (!resultados.find((r) => r.email === email)) {
        resultados.push({ email, status: 'inscrito' })
      }

    } catch (err) {
      resultados.push({ email, status: 'erro', detalhe: err instanceof Error ? err.message : 'Erro desconhecido' })
    }
  }

  revalidatePath(`/admin/eventos/${eventoId}`)
  return resultados
}
