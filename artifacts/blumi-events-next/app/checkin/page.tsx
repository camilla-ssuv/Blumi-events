'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resolverCodigoSessao } from '@/lib/actions/dispositivos'
import { Smartphone, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function AtivacaoForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [codigo, setCodigo] = useState(searchParams.get('codigo') ?? '')
  const [erro, setErro] = useState('')
  const [pending, startTransition] = useTransition()

  function handleAtivar() {
    if (codigo.length !== 6) { setErro('Digite o código de 6 dígitos'); return }
    setErro('')
    startTransition(async () => {
      const dispositivo = await resolverCodigoSessao(codigo)
      if (!dispositivo) {
        setErro('Código inválido ou expirado. Peça um novo código ao administrador.')
        return
      }
      router.push(`/checkin/${codigo}`)
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <div className="w-16 h-16 rounded-full bg-brand-lime/10 flex items-center justify-center mx-auto mb-4">
            <Smartphone size={28} className="text-brand-lime" />
          </div>
          <h1 className="font-display font-bold text-white text-2xl">
            Blū<span className="text-brand-lime">mi</span> Check-in
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Digite o código de sessão fornecido pelo administrador
          </p>
        </div>

        <div className="space-y-4">
          <input
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && handleAtivar()}
            placeholder="000000"
            maxLength={6}
            className="w-full bg-gray-900 border border-gray-700 text-white text-center font-mono text-4xl tracking-[0.4em] py-4 rounded-btn focus:outline-none focus:border-brand-lime placeholder:text-gray-600"
          />

          {erro && (
            <p className="text-status-error text-sm">{erro}</p>
          )}

          <button
            onClick={handleAtivar}
            disabled={codigo.length !== 6 || pending}
            className="w-full bg-brand-lime text-gray-900 font-bold py-3.5 rounded-btn hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
          >
            {pending && <Loader2 size={16} className="animate-spin" />}
            {pending ? 'Ativando…' : 'Ativar terminal'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckinAtivacaoPage() {
  return (
    <Suspense>
      <AtivacaoForm />
    </Suspense>
  )
}
