import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import { DevTools } from '@/components/dev/dev-tools'

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && process.env.NODE_ENV !== 'production'

export const metadata: Metadata = {
  title: 'Blūmi Events',
  description: 'Plataforma de gestão de eventos',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Blūmi Check-in',
  },
}

export const viewport: Viewport = {
  themeColor: '#314C5D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* @ts-expect-error — pnpm workspace @types/react version conflict, runtime is correct */}
        <AuthProvider>{children}</AuthProvider>
        <ServiceWorkerRegister />
        {USE_MOCKS && <DevTools />}
      </body>
    </html>
  )
}
