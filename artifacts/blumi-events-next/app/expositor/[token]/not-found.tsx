export default function ExpositorNotFound() {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <p className="font-display font-bold text-brand-lime text-5xl">404</p>
        <h1 className="font-display font-bold text-white text-xl">Link não encontrado</h1>
        <p className="text-white/50 text-sm">Este link de expositor expirou ou foi revogado.</p>
      </div>
    </div>
  )
}
