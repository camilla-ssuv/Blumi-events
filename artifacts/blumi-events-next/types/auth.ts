export interface BlumIUser {
  user_id: string
  company_id: string | null
  email: string
  name: string
  role: 'super_admin' | 'company_admin' | 'operator' | 'participant'
  modulos_ativos: string[]
  avatar_url?: string
}

export interface AuthSession {
  user: BlumIUser
  token: string
  expires_at: number
}

export interface AuthContextType {
  session: AuthSession | null
  user: BlumIUser | null
  isLoading: boolean
  isAuthenticated: boolean
  hasModule: (slug: string) => boolean
  hasRole: (role: BlumIUser['role'] | BlumIUser['role'][]) => boolean
  signOut: () => void
  refreshSession: () => Promise<void>
}
