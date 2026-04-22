import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth/session'
import { Navbar } from '@/components/layout/navbar'
import { EventoPublicoCliente } from '@/components/catalogo/evento-publico-cliente'

export default async function EventoPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: evento } = await supabase
    .from('eventos')
    .select(`
      id, slug, nome, descricao, tipo, visibilidade, status,
      data_inicio, data_fim, cidade, endereco, vagas_total,
      tenants ( nome, cor_primaria, logo_url ),
      perguntas_triagem ( id, enunciado, tipo, opcoes, obrigatoria, ordem, condicao_pergunta_id, condicao_valor ),
      subeventos ( id, nome, modo_inscricao, inscricao_automatica, data_inicio, local, vagas_total, tipo_tag )
    `)
    .eq('slug', slug)
    .eq('status', 'publicado')
    .single()

  if (!evento) notFound()

  const session = await getServerSession()

  let jaInscrito = false
  if (session?.user.user_id) {
    const { data } = await supabase
      .from('inscricoes')
      .select('id')
      .eq('evento_id', evento.id)
      .eq('participante_id', session.user.user_id)
      .is('subevento_id', null)
      .single()
    jaInscrito = !!data
  }

  const perguntas = [...(evento.perguntas_triagem ?? [])].sort((a, b) => a.ordem - b.ordem)

  return (
    <>
      <Navbar />
      <EventoPublicoCliente
        evento={{ ...evento, perguntas_triagem: perguntas } as any}
        jaInscrito={jaInscrito}
        logado={!!session}
      />
    </>
  )
}
