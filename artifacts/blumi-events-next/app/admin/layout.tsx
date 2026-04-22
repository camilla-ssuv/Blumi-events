import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth/session'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-bg overflow-auto">
        {children}
      </main>
    </div>
  )
}
