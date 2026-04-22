import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth/session'
import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/login')
  if (session.user.role !== 'super_admin') redirect('/sem-acesso')

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-brand-navy h-16 flex items-center px-6 gap-4">
        <Link href="/" className="font-display font-bold text-white text-xl tracking-tight">
          Blū<span className="text-brand-lime">mi</span>
        </Link>
        <span className="text-white/30">/</span>
        <span className="flex items-center gap-2 text-brand-lime font-medium text-sm">
          <ShieldCheck size={16} />
          Super Admin
        </span>
        <div className="flex-1" />
        <Link href="/admin" className="text-sm text-white/60 hover:text-white transition-colors">
          ← Voltar ao admin
        </Link>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
