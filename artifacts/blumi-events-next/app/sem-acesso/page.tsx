export default function SemAcessoPage() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-brand-navy/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V7m0 0a5 5 0 100 10A5 5 0 0012 7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-brand-navy mb-2">Acesso não autorizado</h1>
        <p className="text-gray-500 mb-6">
          Sua empresa não tem acesso a este módulo. Entre em contato com a Blūmi para contratar.
        </p>
        <a
          href="/"
          className="inline-block bg-brand-lime text-gray-900 font-semibold px-6 py-3 rounded-btn hover:opacity-90 transition-opacity"
        >
          Voltar ao início
        </a>
      </div>
    </main>
  )
}
