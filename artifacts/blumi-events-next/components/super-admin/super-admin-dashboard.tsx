'use client'

import { useState, useTransition } from 'react'
import { toggleModulo } from '@/lib/actions/modulos'
import { CheckCircle2, Circle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Empresa = { id: string; name: string }
type Modulo  = { id: string; slug: string; nome: string }
type CompanyModulo = {
  company_id: string
  modulo_id: string
  ativo: boolean
  expira_em: string | null
  config: Record<string, unknown> | null
}

type Props = {
  empresas: Empresa[]
  modulos: Modulo[]
  companyModulos: CompanyModulo[]
}

export function SuperAdminDashboard({ empresas, modulos, companyModulos }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({})
  const [pending, startTransition] = useTransition()

  function key(companyId: string, moduloId: string) {
    return `${companyId}:${moduloId}`
  }

  function isAtivo(companyId: string, moduloId: string): boolean {
    const k = key(companyId, moduloId)
    if (k in optimistic) return optimistic[k]
    return companyModulos.find(
      (cm) => cm.company_id === companyId && cm.modulo_id === moduloId
    )?.ativo ?? false
  }

  function handleToggle(companyId: string, moduloId: string) {
    const k = key(companyId, moduloId)
    const next = !isAtivo(companyId, moduloId)
    setOptimistic((prev) => ({ ...prev, [k]: next }))

    startTransition(async () => {
      try {
        await toggleModulo({ companyId, moduloId, ativo: next })
      } catch {
        // Reverte em caso de erro
        setOptimistic((prev) => ({ ...prev, [k]: !next }))
      }
    })
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">
            Gestão de Módulos
          </h1>
          <p className="text-gray-500 mt-1">
            {empresas.length} empresas · {modulos.length} módulos disponíveis
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {empresas.map((empresa) => {
          const isOpen = expanded === empresa.id
          const modulosAtivos = modulos.filter((m) => isAtivo(empresa.id, m.id))

          return (
            <div key={empresa.id} className="bg-white rounded-card shadow-card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : empresa.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm">
                    {empresa.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-navy">{empresa.name}</p>
                    <p className="text-xs text-gray-400">
                      {modulosAtivos.length === 0
                        ? 'Nenhum módulo ativo'
                        : modulosAtivos.map((m) => m.nome).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {modulos.map((m) => (
                      <span
                        key={m.id}
                        className={cn(
                          'w-2 h-2 rounded-full',
                          isAtivo(empresa.id, m.id) ? 'bg-status-success' : 'bg-gray-200'
                        )}
                        title={m.nome}
                      />
                    ))}
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-6 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {modulos.map((modulo) => {
                      const ativo = isAtivo(empresa.id, modulo.id)
                      return (
                        <button
                          key={modulo.id}
                          onClick={() => handleToggle(empresa.id, modulo.id)}
                          disabled={pending}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-btn border-2 text-left transition-all',
                            ativo
                              ? 'border-status-success bg-green-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          )}
                        >
                          {pending ? (
                            <Loader2 size={16} className="animate-spin text-gray-400" />
                          ) : ativo ? (
                            <CheckCircle2 size={16} className="text-status-success shrink-0" />
                          ) : (
                            <Circle size={16} className="text-gray-300 shrink-0" />
                          )}
                          <div>
                            <p className={cn(
                              'text-sm font-medium',
                              ativo ? 'text-brand-navy' : 'text-gray-500'
                            )}>
                              {modulo.nome}
                            </p>
                            <p className="text-xs text-gray-400">{modulo.slug}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
