'use client'

import React, { createContext, useContext, useCallback } from 'react'
import type { AuthContextType, AuthSession, BlumIUser } from '@/types/auth'

// ---------------------------------------------------------------------------
// MOCK AUTH — sem backend, sem Supabase.
// Retorna super_admin hardcoded. Restaurar AuthContext.tsx.bak quando o
// backend estiver disponível.
// ---------------------------------------------------------------------------

const MOCK_USER: BlumIUser = {
  user_id: 'mock-super-admin-001',
  company_id: null,
  email: 'admin@blumi.com',
  name: 'Super Admin (Mock)',
  role: 'super_admin',
  modulos_ativos: ['eventos', 'pesquisas', 'vagas'],
}

const MOCK_SESSION: AuthSession = {
  user: MOCK_USER,
  token: 'token-super-admin',
  expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasModule = useCallback((slug: string) => MOCK_USER.modulos_ativos.includes(slug), [])
  const hasRole = useCallback((role: BlumIUser['role'] | BlumIUser['role'][]) => {
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(MOCK_USER.role)
  }, [])
  const signOut = useCallback(() => { window.location.href = '/dev-login' }, [])
  const refreshSession = useCallback(async () => {}, [])

  return (
    <AuthContext.Provider value={{
      session: MOCK_SESSION,
      user: MOCK_USER,
      isLoading: false,
      isAuthenticated: true,
      hasModule,
      hasRole,
      signOut,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useModules() {
  const { hasModule, session } = useAuth()
  return {
    hasModule,
    modulos: session?.user.modulos_ativos ?? [],
    companyId: session?.user.company_id ?? null,
    userId: session?.user.user_id ?? null,
    isSuperAdmin: session?.user.role === 'super_admin',
  }
}
