import { notFound } from 'next/navigation'
import { resolverCodigoSessao } from '@/lib/actions/dispositivos'
import { CheckinTerminal } from '@/components/checkin/checkin-terminal'
import type { DispositivoComJoins } from '@/lib/supabase/database.types'

export default async function CheckinTerminalPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const raw = await resolverCodigoSessao(token)
  if (!raw) notFound()

  const dispositivo = raw as unknown as DispositivoComJoins

  return (
    <CheckinTerminal
      dispositivoId={dispositivo.id}
      dispositivoNome={dispositivo.nome}
      eventoId={dispositivo.eventos?.id ?? ''}
      eventoNome={dispositivo.eventos?.nome ?? ''}
      subeventoId={dispositivo.subeventos?.id ?? null}
      subeventoNome={dispositivo.subeventos?.nome ?? null}
      modoInscricaoSubevento={dispositivo.subeventos?.modo_inscricao ?? null}
    />
  )
}
