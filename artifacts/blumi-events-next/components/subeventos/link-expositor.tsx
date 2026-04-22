'use client'

import { useState, useTransition } from 'react'
import { gerarLinkExpositor, revogarLinkExpositor } from '@/lib/actions/expositor'
import { Link2, Copy, Trash2, RefreshCw, Eye, Check } from 'lucide-react'

type LinkAtivo = {
  id: string
  token: string
  views: number
  created_at: string
} | null

type Props = {
  subeventoId: string
  eventoId: string
  linkAtivo: LinkAtivo
}

export function LinkExpositor({ subeventoId, eventoId, linkAtivo: initialLink }: Props) {
  const [link, setLink] = useState(initialLink)
  const [copiado, setCopiado] = useState(false)
  const [pending, startTransition] = useTransition()

  const url = link ? `${typeof window !== 'undefined' ? window.location.origin : ''}/expositor/${link.token}` : ''

  function handleGerar() {
    startTransition(async () => {
      const token = await gerarLinkExpositor(subeventoId, eventoId)
      setLink({ id: '', token, views: 0, created_at: new Date().toISOString() })
    })
  }

  function handleRevogar() {
    if (!link || !confirm('Revogar link? O expositor perderá acesso imediatamente.')) return
    startTransition(async () => {
      await revogarLinkExpositor(link.id, eventoId)
      setLink(null)
    })
  }

  function handleCopiar() {
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Link2 size={11} /> Dashboard do expositor
      </p>

      {link ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-gray-50 rounded-btn px-3 py-2">
            <p className="text-xs text-gray-600 truncate flex-1 font-mono">{url}</p>
            <button
              onClick={handleCopiar}
              className="shrink-0 text-gray-400 hover:text-brand-navy transition-colors"
              title="Copiar link"
            >
              {copiado ? <Check size={14} className="text-status-success" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Eye size={11} /> {link.views} visualizações
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={handleGerar}
                disabled={pending}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-navy transition-colors disabled:opacity-50"
                title="Regenerar link"
              >
                <RefreshCw size={11} className={pending ? 'animate-spin' : ''} /> Regenerar
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={handleRevogar}
                disabled={pending}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-status-error transition-colors disabled:opacity-50"
              >
                <Trash2 size={11} /> Revogar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleGerar}
          disabled={pending}
          className="flex items-center gap-1.5 text-xs text-brand-navy font-medium hover:opacity-70 transition-opacity disabled:opacity-50"
        >
          <Link2 size={12} />
          {pending ? 'Gerando…' : 'Gerar link para expositor'}
        </button>
      )}
    </div>
  )
}
