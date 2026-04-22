import { cn } from '@/lib/utils'

type Status = 'rascunho' | 'publicado' | 'encerrado'

const MAP: Record<Status, { label: string; className: string }> = {
  rascunho:  { label: 'Rascunho',  className: 'bg-gray-100 text-gray-500' },
  publicado: { label: 'Publicado', className: 'bg-green-100 text-status-success' },
  encerrado: { label: 'Encerrado', className: 'bg-gray-100 text-gray-400' },
}

export function EventoStatusBadge({ status }: { status: string }) {
  const s = MAP[status as Status] ?? MAP.rascunho
  return (
    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap', s.className)}>
      {s.label}
    </span>
  )
}
