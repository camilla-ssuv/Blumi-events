// Perfis disponíveis no DevTools e na página /dev-login
export const MOCK_PROFILES = [
  {
    label: 'Super Admin',
    token: 'token-super-admin',
    desc: 'Acessa /super-admin — vê todas as empresas e módulos',
    redirect: '/super-admin',
    color: '#EF4444',
  },
  {
    label: 'Admin XP',
    token: 'token-admin-xp',
    desc: 'company_admin da XP Inc — módulo eventos ativo',
    redirect: '/admin',
    color: '#F59E0B',
  },
  {
    label: 'Admin Nubank',
    token: 'token-admin-nu',
    desc: 'company_admin do Nubank — módulos eventos + pesquisas',
    redirect: '/admin',
    color: '#8B5CF6',
  },
  {
    label: 'Participante',
    token: 'token-participante',
    desc: 'Acessa /eventos e /minha-area como Ana Lima',
    redirect: '/eventos',
    color: '#22C55E',
  },
] as const

export type MockProfile = typeof MOCK_PROFILES[number]
