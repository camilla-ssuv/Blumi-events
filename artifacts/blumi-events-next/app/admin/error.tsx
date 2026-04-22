'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function AdminError({
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-card shadow-sm p-8 max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle size={40} className="text-red-400" />
        </div>
        <h2 className="font-display font-bold text-xl text-brand-navy">Algo deu errado</h2>
        <p className="text-sm text-gray-500">{error.message || 'Ocorreu um erro inesperado.'}</p>
        <button
          onClick={reset}
          className="bg-brand-lime text-gray-900 font-semibold px-6 py-2.5 rounded-btn hover:opacity-90 transition-opacity text-sm"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
