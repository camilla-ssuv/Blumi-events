'use client'

import { useRouter } from 'next/navigation'
import { MOCK_PROFILES } from '@/mocks/auth'

export default function DevLoginPage() {
  const router = useRouter()

  async function entrar(token: string, redirect: string) {
    const res = await fetch('/api/mock/auth/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { alert('Token inválido'); return }

    const user = await res.json()
    const session = { user, token, expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 8 }
    localStorage.setItem('blumi_events_session', JSON.stringify(session))
    document.cookie = `blumi_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            DEV ONLY — dados mockados
          </div>
          <h1 className="font-display text-2xl font-bold text-[#314C5D]">Blūmi Dev Login</h1>
          <p className="text-gray-500 text-sm mt-1">Escolha um perfil para testar</p>
        </div>

        <div className="space-y-3">
          {MOCK_PROFILES.map((p) => (
            <button
              key={p.token}
              onClick={() => entrar(p.token, p.redirect)}
              className="w-full text-left border border-gray-200 rounded-xl p-4 hover:border-[#314C5D] hover:bg-[#F5F6F8] transition-colors group"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <span className="font-semibold text-[#314C5D] group-hover:text-[#1a2e3b]">{p.label}</span>
              </div>
              <div className="text-xs text-gray-400 ml-4">{p.desc}</div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-300 mt-8">
          Sem banco · Sem backend · 100% local
        </p>
      </div>
    </div>
  )
}
