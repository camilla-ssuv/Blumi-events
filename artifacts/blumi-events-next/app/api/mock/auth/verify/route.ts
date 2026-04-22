import { NextRequest, NextResponse } from 'next/server'

// Guard dentro do handler — não no topo do módulo (evita crash no build de produção)
const MOCK_USERS: Record<string, {
  user_id: string
  company_id: string | null
  email: string
  name: string
  role: 'super_admin' | 'company_admin' | 'operator' | 'participant'
  modulos_ativos: string[]
}> = {
  'token-super-admin': {
    user_id: 'user-super-001',
    company_id: null,
    email: 'super@blumi.dev',
    name: 'Super Admin',
    role: 'super_admin',
    modulos_ativos: ['eventos', 'pesquisas', 'vagas'],
  },
  'token-admin-xp': {
    user_id: 'user-admin-xp-001',
    company_id: 'company-xp-001',
    email: 'admin@xp.dev',
    name: 'Admin XP Inc',
    role: 'company_admin',
    modulos_ativos: ['eventos'],
  },
  'token-admin-nu': {
    user_id: 'user-admin-nu-001',
    company_id: 'company-nu-001',
    email: 'admin@nubank.dev',
    name: 'Admin Nubank',
    role: 'company_admin',
    modulos_ativos: ['eventos', 'pesquisas'],
  },
  'token-participante': {
    user_id: 'part-001',
    company_id: null,
    email: 'ana@email.com',
    name: 'Ana Lima',
    role: 'participant',
    modulos_ativos: [],
  },
  // Mantém tokens legados para não quebrar sessões salvas anteriormente
  'token-company-admin': {
    user_id: 'user-admin-xp-001',
    company_id: 'company-xp-001',
    email: 'admin@xp.dev',
    name: 'Admin XP Inc',
    role: 'company_admin',
    modulos_ativos: ['eventos'],
  },
  'token-operador': {
    user_id: 'user-op-001',
    company_id: 'company-xp-001',
    email: 'operador@xp.dev',
    name: 'Operador XP',
    role: 'operator',
    modulos_ativos: ['eventos'],
  },
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '').trim()

  const user = MOCK_USERS[token]
  if (!user) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  return NextResponse.json(user)
}
