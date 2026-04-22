'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_PROFILES } from '@/mocks/auth'

export function DevTools() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [pending, startTransition] = useTransition()

  async function switchProfile(token: string, redirect: string) {
    const res = await fetch('/api/mock/auth/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { setFeedback('Erro ao trocar perfil'); return }

    const user = await res.json()
    const session = { user, token, expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 8 }
    localStorage.setItem('blumi_events_session', JSON.stringify(session))
    document.cookie = `blumi_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`

    setFeedback(`✓ ${user.name}`)
    setTimeout(() => setFeedback(''), 2000)
    router.push(redirect)
    router.refresh()
  }

  function resetDb() {
    startTransition(async () => {
      const res = await fetch('/api/mock/reset', { method: 'POST' })
      if (res.ok) {
        setFeedback('✓ Dados resetados')
        router.refresh()
      } else {
        setFeedback('Erro ao resetar')
      }
      setTimeout(() => setFeedback(''), 2500)
    })
  }

  function logout() {
    localStorage.removeItem('blumi_events_session')
    document.cookie = 'blumi_session=; path=/; max-age=0'
    router.push('/dev-login')
    router.refresh()
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      {/* Painel expandido */}
      {open && (
        <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-64 overflow-hidden border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Dev Tools</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
          </div>

          {/* Seletor de perfil */}
          <div className="px-4 py-3 border-b border-gray-700">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Trocar perfil</p>
            <div className="space-y-1">
              {MOCK_PROFILES.map((p) => (
                <button
                  key={p.token}
                  onClick={() => switchProfile(p.token, p.redirect)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white">{p.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-4 mt-0.5 leading-tight">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={resetDb}
              disabled={pending}
              className="w-full text-left px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            >
              🔄 Resetar dados mockados
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 hover:text-red-400 transition-colors"
            >
              ← Ir para /dev-login
            </button>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="px-4 py-2 bg-gray-800 text-xs text-green-400 border-t border-gray-700">
              {feedback}
            </div>
          )}
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg border border-gray-700 hover:bg-gray-800 transition-colors"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        MOCK MODE
      </button>
    </div>
  )
}
