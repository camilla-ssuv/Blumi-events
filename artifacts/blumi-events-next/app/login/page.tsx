'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL ?? ''

function LoginContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/admin/eventos'

  // Se já autenticado, redireciona
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(next)
    }
  }, [isAuthenticated, isLoading, next, router])

  const loginUrl = `${AUTH_API_URL}/login?redirect=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.origin : ''
  )}`

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-lime border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-xl">
        <div className="w-12 h-12 rounded-full bg-brand-navy flex items-center justify-center mx-auto mb-6">
          <span className="font-display font-bold text-brand-lime text-lg">B</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-navy mb-2 font-display">
          Acesse sua conta
        </h1>
        <p className="text-gray-500 mb-8 text-sm">
          Use o mesmo login do portal Blūmi Talentos
        </p>
        <a
          href={loginUrl}
          className="block w-full bg-brand-lime text-gray-900 font-bold py-3 px-6 rounded-btn hover:opacity-90 transition-opacity"
        >
          Entrar com Blūmi
        </a>
        <p className="text-xs text-gray-400 mt-6">
          Não tem conta?{' '}
          <a
            href={`${AUTH_API_URL}/cadastro`}
            className="underline hover:text-brand-navy transition-colors"
          >
            Cadastre-se no portal de talentos
          </a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
