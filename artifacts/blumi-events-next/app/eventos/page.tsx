import { createClient } from '@/lib/supabase/server'
import { CatalogoCliente } from '@/components/catalogo/catalogo-cliente'
import type { EventoCatalogoRow } from '@/lib/supabase/database.types'

export default async function CatalogoPage() {
  const supabase = await createClient()

  const { data: eventos } = await supabase
    .from('eventos')
    .select(`
      id, slug, nome, tipo, visibilidade, status,
      data_inicio, data_fim, cidade, vagas_total,
      tenants ( nome, cor_primaria, logo_url )
    `)
    .eq('status', 'publicado')
    .order('data_inicio', { ascending: true })

  return <CatalogoCliente eventos={(eventos ?? []) as any} />
}
