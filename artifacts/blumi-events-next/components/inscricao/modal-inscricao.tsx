'use client'

import { useState, useTransition } from 'react'
import { inscrever, type RespostaTriagem } from '@/lib/actions/inscricoes'
import { X, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Pergunta = {
  id: string
  enunciado: string
  tipo: string
  opcoes: string[] | null
  obrigatoria: boolean
  condicao_pergunta_id?: string | null
  condicao_valor?: string | null
}

type Evento = {
  id: string
  nome: string
  visibilidade: string
  codigo_convite?: string
  perguntas_triagem: Pergunta[]
}

type Props = {
  evento: Evento
  onClose: () => void
  onSuccess: () => void
}

type Etapa = 'convite' | 'triagem' | 'sucesso'

export function ModalInscricao({ evento, onClose, onSuccess }: Props) {
  const precisaConvite = evento.visibilidade === 'convite'
  const [etapa, setEtapa] = useState<Etapa>(precisaConvite ? 'convite' : 'triagem')
  const [codigoConvite, setCodigoConvite] = useState('')
  const [erroConvite, setErroConvite] = useState('')
  const [respostas, setRespostas] = useState<Record<string, string | string[]>>({})
  const [erro, setErro] = useState('')
  const [pending, startTransition] = useTransition()

  function validarConvite() {
    if (codigoConvite.trim().toUpperCase() !== (evento.codigo_convite ?? '').toUpperCase()) {
      setErroConvite('Código inválido. Verifique e tente novamente.')
      return
    }
    setErroConvite('')
    setEtapa(evento.perguntas_triagem.length > 0 ? 'triagem' : 'sucesso')
    if (evento.perguntas_triagem.length === 0) handleInscrever([])
  }

  function handleInscrever(respostasArray: RespostaTriagem[]) {
    setErro('')
    startTransition(async () => {
      try {
        await inscrever({
          evento_id: evento.id,
          respostas: respostasArray,
          codigo_convite: precisaConvite ? codigoConvite : undefined,
        })
        setEtapa('sucesso')
        setTimeout(onSuccess, 1500)
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Erro ao realizar inscrição')
      }
    })
  }

  function perguntaVisivel(p: Pergunta): boolean {
    if (!p.condicao_pergunta_id || !p.condicao_valor) return true
    const resposta = respostas[p.condicao_pergunta_id]
    if (Array.isArray(resposta)) return resposta.includes(p.condicao_valor)
    return resposta === p.condicao_valor
  }

  function handleSubmitTriagem() {
    const visiveis = evento.perguntas_triagem.filter(perguntaVisivel)
    const obrigatorias = visiveis.filter((p) => p.obrigatoria)
    for (const p of obrigatorias) {
      const r = respostas[p.id]
      if (!r || (Array.isArray(r) ? r.length === 0 : r.trim() === '')) {
        setErro(`Responda a pergunta obrigatória: "${p.enunciado}"`)
        return
      }
    }

    const respostasArray: RespostaTriagem[] = visiveis.map((p) => {
      const r = respostas[p.id]
      if (p.tipo === 'multipla_escolha') {
        return { pergunta_id: p.id, opcoes: Array.isArray(r) ? r : [] }
      }
      return { pergunta_id: p.id, resposta: typeof r === 'string' ? r : undefined }
    })

    handleInscrever(respostasArray)
  }

  function setResposta(id: string, valor: string | string[]) {
    setRespostas((prev) => ({ ...prev, [id]: valor }))
  }

  const inputCls = 'w-full border border-gray-200 rounded-btn px-3 py-2.5 text-sm focus:outline-none focus:border-brand-navy'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-card shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <p className="text-xs text-gray-400 font-medium">Inscrição</p>
            <h2 className="font-display font-bold text-brand-navy text-lg leading-tight">
              {evento.nome}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-btn transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* Etapa 1: Código de convite */}
          {etapa === 'convite' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Este evento é por convite. Digite o código para continuar.
              </p>
              <input
                autoFocus
                value={codigoConvite}
                onChange={(e) => setCodigoConvite(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && validarConvite()}
                placeholder="CÓDIGO DE CONVITE"
                className={cn(inputCls, 'uppercase tracking-widest font-mono text-center text-lg')}
              />
              {erroConvite && (
                <p className="text-status-error text-sm">{erroConvite}</p>
              )}
              <button
                onClick={validarConvite}
                className="w-full bg-brand-lime text-gray-900 font-bold py-3 rounded-btn hover:opacity-90 transition-opacity"
              >
                Verificar código
              </button>
            </div>
          )}

          {/* Etapa 2: Triagem */}
          {etapa === 'triagem' && (
            <div className="space-y-5">
              {evento.perguntas_triagem.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma pergunta de triagem. Clique para confirmar.
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    Responda as perguntas abaixo para concluir sua inscrição.
                  </p>
                  {evento.perguntas_triagem.filter(perguntaVisivel).map((pergunta) => (
                    <div key={pergunta.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {pergunta.enunciado}
                        {pergunta.obrigatoria && <span className="text-status-error ml-1">*</span>}
                      </label>

                      {pergunta.tipo === 'texto' && (
                        <textarea
                          rows={2}
                          value={(respostas[pergunta.id] as string) ?? ''}
                          onChange={(e) => setResposta(pergunta.id, e.target.value)}
                          className={inputCls}
                        />
                      )}

                      {pergunta.tipo === 'escolha_unica' && (
                        <div className="space-y-2">
                          {(pergunta.opcoes ?? []).map((opcao) => (
                            <label key={opcao} className="flex items-center gap-2.5 cursor-pointer">
                              <input
                                type="radio"
                                name={pergunta.id}
                                value={opcao}
                                checked={respostas[pergunta.id] === opcao}
                                onChange={() => setResposta(pergunta.id, opcao)}
                                className="accent-brand-navy"
                              />
                              <span className="text-sm text-gray-700">{opcao}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {pergunta.tipo === 'multipla_escolha' && (
                        <div className="space-y-2">
                          {(pergunta.opcoes ?? []).map((opcao) => {
                            const selecionadas = (respostas[pergunta.id] as string[]) ?? []
                            const marcado = selecionadas.includes(opcao)
                            return (
                              <label key={opcao} className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={marcado}
                                  onChange={() => {
                                    setResposta(
                                      pergunta.id,
                                      marcado
                                        ? selecionadas.filter((s) => s !== opcao)
                                        : [...selecionadas, opcao]
                                    )
                                  }}
                                  className="accent-brand-navy rounded"
                                />
                                <span className="text-sm text-gray-700">{opcao}</span>
                              </label>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {erro && (
                <p className="text-status-error text-sm bg-red-50 border border-red-100 rounded-btn px-3 py-2">
                  {erro}
                </p>
              )}

              <button
                onClick={handleSubmitTriagem}
                disabled={pending}
                className="w-full bg-brand-lime text-gray-900 font-bold py-3 rounded-btn hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {pending && <Loader2 size={16} className="animate-spin" />}
                {pending ? 'Confirmando inscrição…' : 'Confirmar inscrição'}
              </button>
            </div>
          )}

          {/* Sucesso */}
          {etapa === 'sucesso' && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 size={48} className="text-status-success mx-auto" />
              <h3 className="font-display font-bold text-brand-navy text-xl">Inscrição confirmada!</h3>
              <p className="text-gray-500 text-sm">
                Acesse <strong>Minha Área</strong> para ver seu QR Code de acesso.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
