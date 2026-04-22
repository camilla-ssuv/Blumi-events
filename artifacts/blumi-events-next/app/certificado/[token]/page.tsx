import { notFound } from 'next/navigation'
import { buscarCertificado } from '@/lib/actions/certificados'
import { CertificadoVisual } from '@/components/certificado/certificado-visual'
import type { InscricaoCertificadoRow } from '@/lib/supabase/database.types'

export default async function CertificadoPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const raw = await buscarCertificado(token)

  if (!raw) notFound()

  const inscricao = raw as unknown as InscricaoCertificadoRow
  const evento = inscricao.eventos
  if (!evento?.emitir_certificados) notFound()

  const checkinValido = inscricao.checkins?.some((c) => !c.cancelado)
  if (!checkinValido) notFound()

  const tenant = evento.tenants

  return (
    <CertificadoVisual
      participanteNome={inscricao.participantes?.nome ?? 'Participante'}
      eventoNome={evento.nome}
      organizadorNome={tenant?.nome ?? 'Blūmi Events'}
      dataInicio={evento.data_inicio}
      dataFim={evento.data_fim}
      titulo={evento.certificado_titulo ?? 'Certificado de Participação'}
      cargaHoraria={evento.certificado_carga_horaria}
      corPrimaria={tenant?.cor_primaria ?? '#DEFF66'}
    />
  )
}
