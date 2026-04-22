'use client'

import { useModules } from '@/hooks/use-modules'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ModuleGuardProps {
  module: string
  children: React.ReactNode
}

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { hasModule, userId } = useModules()
  const router = useRouter()

  useEffect(() => {
    if (userId && !hasModule(module)) {
      router.replace('/sem-acesso')
    }
  }, [userId, module, hasModule, router])

  if (!userId) return null
  if (!hasModule(module)) return null

  return <>{children}</>
}
