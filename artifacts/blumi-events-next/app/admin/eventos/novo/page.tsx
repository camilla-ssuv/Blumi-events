import { EventoForm } from '@/components/eventos/evento-form'

export default function NovoEventoPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Novo evento</h1>
        <p className="text-gray-500 mt-1">Preencha as informações básicas. Você pode editar depois.</p>
      </div>
      <EventoForm />
    </div>
  )
}
