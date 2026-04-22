'use client'

import { CheckCircle2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

type Modulo = {
  id: string
  slug: string
  nome: string
  url_base: string | null
  contratado: boolean
  expira_em: string | null
}

const MODULO_META: Record<string, { descricao: string; cor: string }> = {
  eventos:   { descricao: 'Crie e gerencie feiras, palestras e workshops com check-in inteligente.', cor: '#4ECDC4' },
  pesquisas: { descricao: 'Surveys proprietários, análise de dados e relatórios de feedback.', cor: '#FF6B8A' },
  vagas:     { descricao: 'Publicação de vagas, triagem de candidatos e pipeline de seleção.', cor: '#DEFF66' },
}

export function ModulosAdminView({ modulos }: { modulos: Modulo[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modulos.map((modulo) => {
        const meta = MODULO_META[modulo.slug] ?? { descricao: '', cor: '#94A3B8' }
        return (
          <div
            key={modulo.id}
            className={cn(
              'bg-white rounded-card shadow-card border-t-4 p-6 flex flex-col gap-4',
              !modulo.contratado && 'opacity-70'
            )}
            style={{ borderTopColor: meta.cor }}
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display font-bold text-brand-navy text-lg">{modulo.nome}</h2>
              {modulo.contratado ? (
                <span className="flex items-center gap-1 text-xs font-medium text-status-success bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">
                  <CheckCircle2 size={12} /> Ativo
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                  <Lock size={12} /> Não contratado
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 flex-1">{meta.descricao}</p>

            {modulo.contratado && modulo.expira_em && (
              <p className="text-xs text-status-warning">
                Trial até {new Date(modulo.expira_em).toLocaleDateString('pt-BR')}
              </p>
            )}

            {!modulo.contratado && (
              <a
                href="mailto:comercial@blumi.com.br?subject=Quero contratar o módulo de pesquisas"
                className="mt-auto inline-block text-center bg-brand-navy text-white text-sm font-semibold px-4 py-2.5 rounded-btn hover:opacity-90 transition-opacity"
              >
                Falar com a Blūmi
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
