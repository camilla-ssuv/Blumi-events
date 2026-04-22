import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth/session'
import { Navbar } from '@/components/layout/navbar'

export default async function MinhaAreaLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/login?next=/minha-area')

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bg">{children}</main>
    </>
  )
}
