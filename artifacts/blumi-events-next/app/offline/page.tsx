export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center text-white px-6">
      <div className="text-6xl mb-6">📡</div>
      <h1 className="font-display text-2xl font-bold mb-2">Sem conexão</h1>
      <p className="text-white/70 text-center max-w-xs">
        O terminal está offline. Reconecte para sincronizar os check-ins pendentes.
      </p>
    </div>
  )
}
