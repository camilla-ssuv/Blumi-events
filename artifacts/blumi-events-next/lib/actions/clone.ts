'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
function gerarSlug(nome: string): string {
  const base = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
  return `${base}-${Date.now().toString(36)}`
}

export async function clonarEvento(eventoId: string): Promise<string> {
  const supabase = await createClient()

  const [
    { data: evento },
    { data: perguntas },
    { data: subeventos },
    { data: tipos },
  ] = await Promise.all([
    supabase.from('eventos').select('*').eq('id', eventoId).single(),
    supabase.from('perguntas_triagem').select('*').eq('evento_id', eventoId).order('ordem'),
    supabase.from('subeventos').select('*').eq('evento_id', eventoId).order('created_at'),
    supabase.from('tipos_ingresso').select('*').eq('evento_id', eventoId),
  ])

  if (!evento) throw new Error('Evento não encontrado')

  const nomeClone = `${evento.nome} (Cópia)`
  const slug = await gerarSlug(nomeClone)

  const { data: novoEvento, error: errEvento } = await supabase
    .from('eventos')
    .insert({
      tenant_id: evento.tenant_id,
      nome: nomeClone,
      slug,
      tipo: evento.tipo,
      visibilidade: evento.visibilidade,
      descricao: evento.descricao,
      cidade: evento.cidade,
      endereco: evento.endereco,
      vagas_total: evento.vagas_total,
      codigo_convite: evento.codigo_convite,
      status: 'rascunho',
      // datas intencionalmente omitidas
    })
    .select('id')
    .single()

  if (errEvento || !novoEvento) throw new Error(errEvento?.message ?? 'Erro ao clonar')

  const novoEventoId = novoEvento.id

  // Clona perguntas mantendo lógica condicional
  if (perguntas && perguntas.length > 0) {
    const idMap: Record<string, string> = {}

    // Primeiro pass: cria sem condições para obter novos IDs
    for (const p of perguntas) {
      const { data: nova } = await supabase
        .from('perguntas_triagem')
        .insert({
          evento_id: novoEventoId,
          enunciado: p.enunciado,
          tipo: p.tipo,
          opcoes: p.opcoes,
          obrigatoria: p.obrigatoria,
          ordem: p.ordem,
        })
        .select('id')
        .single()
      if (nova) idMap[p.id] = nova.id
    }

    // Segundo pass: atualiza condições com novos IDs
    for (const p of perguntas) {
      if (p.condicao_pergunta_id && idMap[p.condicao_pergunta_id] && idMap[p.id]) {
        await supabase
          .from('perguntas_triagem')
          .update({
            condicao_pergunta_id: idMap[p.condicao_pergunta_id],
            condicao_valor: p.condicao_valor,
          })
          .eq('id', idMap[p.id])
      }
    }
  }

  // Clona subeventos
  if (subeventos && subeventos.length > 0) {
    await supabase.from('subeventos').insert(
      subeventos.map((s) => ({
        evento_id: novoEventoId,
        nome: s.nome,
        descricao: s.descricao,
        modo_inscricao: s.modo_inscricao,
        inscricao_automatica: s.inscricao_automatica,
        local: s.local,
        vagas_total: s.vagas_total,
        tipo_tag: s.tipo_tag,
        // datas omitidas intencionalmente
      }))
    )
  }

  // Clona tipos de ingresso
  if (tipos && tipos.length > 0) {
    await supabase.from('tipos_ingresso').insert(
      tipos.map((t) => ({
        evento_id: novoEventoId,
        nome: t.nome,
        descricao: t.descricao,
        vagas: t.vagas,
      }))
    )
  }

  revalidatePath('/admin/eventos')
  return novoEventoId
}
