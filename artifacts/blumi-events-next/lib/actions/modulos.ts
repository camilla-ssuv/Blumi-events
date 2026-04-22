'use server'

import { createPrincipalServiceClient } from '@/lib/supabase/principal'
import { getServerSession } from '@/lib/auth/session'

type ToggleModuloInput = {
  companyId: string
  moduloId: string
  ativo: boolean
}

export async function toggleModulo({ companyId, moduloId, ativo }: ToggleModuloInput) {
  const session = await getServerSession()
  if (!session) throw new Error('Não autenticado')
  if (session.user.role !== 'super_admin') throw new Error('Acesso negado')

  const serviceClient = createPrincipalServiceClient()
  const { error } = await serviceClient
    .from('company_modulos')
    .upsert(
      { company_id: companyId, modulo_id: moduloId, ativo, ativado_por: session.user.user_id },
      { onConflict: 'company_id,modulo_id' }
    )

  if (error) throw new Error(error.message)
}
