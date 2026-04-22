'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth, useModules } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  ClipboardList,
  Briefcase,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  module?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  href: '/admin',           icon: <LayoutDashboard size={18} /> },
  { label: 'Eventos',    href: '/admin/eventos',    icon: <CalendarDays size={18} />,    module: 'eventos' },
  { label: 'Pesquisas',  href: '/admin/pesquisas',  icon: <ClipboardList size={18} />,   module: 'pesquisas' },
  { label: 'Vagas',      href: '/admin/vagas',      icon: <Briefcase size={18} />,       module: 'vagas' },
  { label: 'Módulos',    href: '/admin/modulos',    icon: <Settings size={18} /> },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const { hasModule, isSuperAdmin } = useModules()

  const visibleItems = NAV_ITEMS.filter((item) =>
    !item.module || hasModule(item.module)
  )

  return (
    <aside className="w-60 min-h-screen bg-brand-navy flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <span className="font-display font-bold text-white text-xl tracking-tight">
          Blū<span className="text-brand-lime">mi</span>
        </span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-lime text-gray-900'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}

        {isSuperAdmin && (
          <Link
            href="/super-admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors mt-4 border border-brand-lime/30',
              pathname.startsWith('/super-admin')
                ? 'bg-brand-lime text-gray-900'
                : 'text-brand-lime/80 hover:text-brand-lime hover:bg-brand-lime/10'
            )}
          >
            <ShieldCheck size={18} />
            Super Admin
          </Link>
        )}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
