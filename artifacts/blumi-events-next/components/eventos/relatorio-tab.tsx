'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

type Participante = {
  id: string
  tipos_ingresso: { nome: string } | null
  checkins: { id: string; cancelado: boolean }[] | null
}

type Pergunta = {
  id: string
  enunciado: string
  tipo: string
  ordem: number
}

type Resposta = {
  pergunta_id: string
  resposta: string | null
  opcoes: string[] | null
}

type Props = {
  participantes: Participante[]
  perguntas: Pergunta[]
  respostas: Resposta[]
}

export function RelatorioTab({ participantes, perguntas, respostas }: Props) {
  const total = participantes.length
  const presentes = participantes.filter((p) =>
    (p.checkins ?? []).some((c) => !c.cancelado)
  ).length
  const ausentes = total - presentes
  const taxa = total > 0 ? Math.round((presentes / total) * 100) : 0

  // Contagem por tipo de ingresso
  const porIngresso = useMemo(() => {
    const map: Record<string, number> = {}
    participantes.forEach((p) => {
      const nome = p.tipos_ingresso?.nome ?? 'Sem tipo'
      map[nome] = (map[nome] ?? 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [participantes])

  // Agregação de respostas por pergunta
  const analisePerguntas = useMemo(() => {
    const perguntasOrdenadas = [...perguntas]
      .filter((p) => p.tipo !== 'texto')
      .sort((a, b) => a.ordem - b.ordem)

    return perguntasOrdenadas.map((pergunta) => {
      const respostasDaPergunta = respostas.filter((r) => r.pergunta_id === pergunta.id)
      const contagem: Record<string, number> = {}

      respostasDaPergunta.forEach((r) => {
        if (r.opcoes && r.opcoes.length > 0) {
          r.opcoes.forEach((op) => {
            contagem[op] = (contagem[op] ?? 0) + 1
          })
        } else if (r.resposta) {
          contagem[r.resposta] = (contagem[r.resposta] ?? 0) + 1
        }
      })

      const total_respostas = respostasDaPergunta.length
      const distribuicao = Object.entries(contagem)
        .sort((a, b) => b[1] - a[1])
        .map(([valor, count]) => ({
          valor,
          count,
          pct: total_respostas > 0 ? Math.round((count / total_respostas) * 100) : 0,
        }))

      return { pergunta, distribuicao, total_respostas }
    })
  }, [perguntas, respostas])

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Presença */}
      <div className="bg-white rounded-card shadow-card p-6">
        <h3 className="font-display font-bold text-brand-navy text-lg mb-4">Presença</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Inscritos', valor: total, cor: 'text-brand-navy' },
            { label: 'Presentes', valor: presentes, cor: 'text-status-success' },
            { label: 'Ausentes', valor: ausentes, cor: 'text-gray-400' },
          ].map(({ label, valor, cor }) => (
            <div key={label} className="text-center py-3 bg-gray-50 rounded-btn">
              <p className={cn('font-display font-extrabold text-3xl', cor)}>{valor}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500">Taxa de comparecimento</span>
            <span className="font-bold text-brand-navy">{taxa}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-status-success h-3 rounded-full transition-all duration-700"
              style={{ width: `${taxa}%` }}
            />
          </div>
        </div>
      </div>

      {/* Por tipo de ingresso */}
      {porIngresso.length > 0 && (
        <div className="bg-white rounded-card shadow-card p-6">
          <h3 className="font-display font-bold text-brand-navy text-lg mb-4">Por tipo de ingresso</h3>
          <div className="space-y-3">
            {porIngresso.map(([nome, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={nome}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{nome}</span>
                    <span className="font-semibold text-brand-navy">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-brand-navy h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Triagem — por pergunta */}
      {analisePerguntas.length === 0 && (
        <div className="bg-white rounded-card shadow-card p-6 text-center">
          <p className="text-gray-400 text-sm">Não há perguntas de triagem com opções para analisar.</p>
        </div>
      )}

      {analisePerguntas.map(({ pergunta, distribuicao, total_respostas }) => (
        <div key={pergunta.id} className="bg-white rounded-card shadow-card p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-sm leading-snug flex-1 pr-4">
              {pergunta.enunciado}
            </h3>
            <span className="text-xs text-gray-400 shrink-0">{total_respostas} respostas</span>
          </div>

          {distribuicao.length === 0 ? (
            <p className="text-gray-400 text-sm">Sem respostas registradas.</p>
          ) : (
            <div className="space-y-2.5">
              {distribuicao.map(({ valor, count, pct }) => (
                <div key={valor}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 truncate pr-2">{valor}</span>
                    <span className="shrink-0 font-semibold text-brand-navy">
                      {count} <span className="text-gray-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: '#DEFF66',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
