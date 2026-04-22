'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt || dismissed) return null

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setPrompt(null)
    else setDismissed(true)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-brand-navy text-white rounded-card shadow-lg p-4 flex items-center gap-3">
      <div className="flex-1">
        <p className="font-semibold text-sm">Instalar terminal</p>
        <p className="text-white/60 text-xs mt-0.5">Acesso rápido sem navegador</p>
      </div>
      <button
        onClick={handleInstall}
        className="bg-brand-lime text-gray-900 font-bold text-sm px-3 py-1.5 rounded-btn flex items-center gap-1.5"
      >
        <Download size={14} />
        Instalar
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-white/50 hover:text-white p-1"
        aria-label="Dispensar"
      >
        <X size={16} />
      </button>
    </div>
  )
}
