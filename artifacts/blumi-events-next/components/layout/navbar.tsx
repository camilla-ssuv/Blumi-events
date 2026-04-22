'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function Navbar() {
  const { user, isLoading } = useAuth()

  return (
    <nav className="bg-brand-navy h-16 flex items-center px-6 gap-6">
      <Link href="/" className="font-display font-bold text-white text-xl tracking-tight">
        Blū<span className="text-brand-lime">mi</span>
      </Link>

      <div className="flex-1" />

      {!isLoading && (
        user ? (
          <div className="flex items-center gap-3">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-lime flex items-center justify-center text-brand-navy font-bold text-sm">
                {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
              </div>
            )}
            <span className="text-white/70 text-sm hidden sm:block">{user.name || user.email}</span>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Entrar
          </Link>
        )
      )}
    </nav>
  )
}
