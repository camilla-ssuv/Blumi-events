import { InstallPrompt } from '@/components/pwa/install-prompt'

export default function CheckinLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
    </>
  )
}
