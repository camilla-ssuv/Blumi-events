'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-brand-navy flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle size={48} className="text-brand-lime" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Algo deu errado</h1>
          <p className="text-sm text-white/60">{error.message || 'Ocorreu um erro inesperado.'}</p>
          <button
            onClick={reset}
            className="bg-brand-lime text-gray-900 font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
