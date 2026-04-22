'use server'

import { createClient } from '@/lib/supabase/server'
import type { InscricaoCsvRow } from '@/lib/supabase/database.types'

export async function gerarCsvEvento(eventoId: string): Promise<string> {
  const supabase = await createClient()

  // Busca perguntas de triagem para montar cabeçalho dinâmico
  const { data: perguntas } = await supabase
    .from('perguntas_triagem')
    .select('id, enunciado, tipo')
    .eq('evento_id', eventoId)
    .order('ordem')

  // Busca inscrições com dados completos
  const { data: inscricoes, error } = await supabase
    .from('inscricoes')
    .select(`
      id, created_at,
      participantes ( nome, email ),
      tipos_ingresso ( nome ),
      checkins ( created_at, cancelado ),
      respostas_triagem ( pergunta_id, resposta, opcoes )
    `)
    .eq('evento_id', eventoId)
    .is('subevento_id', null)
    .order('created_at')

  if (error) throw new Error(error.message)

  const perguntasOrdenadas = perguntas ?? []

  // Cabeçalho — ordem obrigatória da SPEC
  const cabecalho = [
    'Data/hora inscrição',
    'Nome',
    'E-mail',
    'Tipo de ingresso',
    'Hora check-in',
    ...perguntasOrdenadas.map((p) => p.enunciado),
    'Compareceu',
  ]

  const linhas: string[][] = [cabecalho]

  for (const row of inscricoes ?? []) {
    const inscricao = row as unknown as InscricaoCsvRow
    const checkinValido = inscricao.checkins?.find((c) => !c.cancelado)

    const respostaMap = new Map(
      inscricao.respostas_triagem?.map((r) => [r.pergunta_id, r]) ?? []
    )

    const respostaCols = perguntasOrdenadas.map((p) => {
      const r = respostaMap.get(p.id)
      if (!r) return ''
      if (p.tipo === 'multipla_escolha') {
        return (r.opcoes ?? []).join(';')
      }
      return r.resposta ?? ''
    })

    linhas.push([
      formatarDataHora(inscricao.created_at),
      inscricao.participantes?.nome ?? '',
      inscricao.participantes?.email ?? '',
      inscricao.tipos_ingresso?.nome ?? '',
      checkinValido ? formatarDataHora(checkinValido.created_at) : '',
      ...respostaCols,
      checkinValido ? 'Sim' : 'Não',
    ])
  }

  // UTF-8 com BOM — obrigatório para Excel do Windows não quebrar acentos
  const bom = '\uFEFF'
  const csv = linhas
    .map((linha) => linha.map(escaparCelula).join(','))
    .join('\r\n')

  return bom + csv
}

export async function gerarCsvSubevento(subeventoId: string, eventoId: string): Promise<string> {
  const supabase = await createClient()

  const { data: subevento } = await supabase
    .from('subeventos')
    .select('nome')
    .eq('id', subeventoId)
    .single()

  const { data: inscricoes } = await supabase
    .from('inscricoes')
    .select(`
      id, created_at,
      participantes ( nome, email ),
      tipos_ingresso ( nome ),
      checkins ( created_at, cancelado )
    `)
    .eq('subevento_id', subeventoId)
    .order('created_at')

  const cabecalho = [
    'Data/hora inscrição', 'Nome', 'E-mail', 'Tipo de ingresso', 'Hora check-in', 'Compareceu',
  ]

  const linhas: string[][] = [cabecalho]

  for (const row of inscricoes ?? []) {
    const i = row as unknown as InscricaoCsvRow
    const checkin = i.checkins?.find((c) => !c.cancelado)
    linhas.push([
      formatarDataHora(i.created_at),
      i.participantes?.nome ?? '',
      i.participantes?.email ?? '',
      i.tipos_ingresso?.nome ?? '',
      checkin ? formatarDataHora(checkin.created_at) : '',
      checkin ? 'Sim' : 'Não',
    ])
  }

  const bom = '\uFEFF'
  return bom + linhas.map((l) => l.map(escaparCelula).join(',')).join('\r\n')
}

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function escaparCelula(valor: string): string {
  if (valor.includes(',') || valor.includes('"') || valor.includes('\n') || valor.includes(';')) {
    return `"${valor.replace(/"/g, '""')}"`
  }
  return valor
}
