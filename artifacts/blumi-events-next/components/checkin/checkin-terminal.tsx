'use client'

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { realizarCheckin, realizarCheckinModoB, buscarPorNomeOuEmail, buscarInscricoesParaOffline, type CheckinResultado } from '@/lib/actions/checkin'
import {
  salvarInscricoesOffline, buscarInscricaoLocal, enfileirarCheckin,
  obterFilaPendente, marcarSincronizado, marcarCheckinLocal,
} from '@/lib/checkin-offline'
import { ScannerCamera } from './scanner-camera'
import { Camera, Usb, Search, CheckCircle2, XCircle, AlertCircle, Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  dispositivoId: string
  dispositivoNome: string
  eventoId: string
  eventoNome: string
  subeventoId: string | null
  subeventoNome: string | null
  modoInscricaoSubevento: 'inscricao' | 'checkin_livre' | null
}

type ModoInput = 'usb' | 'camera' | 'manual'
type HistoricoItem = CheckinResultado & { ts: number }

function usarBeep() {
  const ctxRef = useRef<AudioContext | null>(null)

  return function beep(tipo: 'sucesso' | 'erro' | 'aviso') {
    if (typeof window === 'undefined') return
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    const ctx = ctxRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (tipo === 'sucesso') {
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(); osc.stop(ctx.currentTime + 0.3)
    } else if (tipo === 'erro') {
      osc.frequency.value = 220
      osc.type = 'sawtooth'
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
      osc.start(); osc.stop(ctx.currentTime + 0.5)
    } else {
      osc.frequency.value = 440
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
      osc.start(); osc.stop(ctx.currentTime + 0.2)
    }
  }
}

export function CheckinTerminal({
  dispositivoId, dispositivoNome, eventoId, eventoNome, subeventoId, subeventoNome, modoInscricaoSubevento,
}: Props) {
  const isModoB = modoInscricaoSubevento === 'checkin_livre'
  const [modo, setModo] = useState<ModoInput>('usb')
  const [resultado, setResultado] = useState<CheckinResultado | null>(null)
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [buscaTermo, setBuscaTermo] = useState('')
  const [buscaResultados, setBuscaResultados] = useState<any[]>([])
  const [online, setOnline] = useState(true)
  const [totalHoje, setTotalHoje] = useState(0)
  const [filaOffline, setFilaOffline] = useState(0)
  const [sincronizando, setSincronizando] = useState(false)
  const usbInputRef = useRef<HTMLInputElement>(null)
  const usbBufferRef = useRef('')
  const usbTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const processingRef = useRef(false)
  const beep = usarBeep()
  const [pending, startTransition] = useTransition()

  // Monitora conexão
  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Download inicial das inscrições para IndexedDB
  useEffect(() => {
    buscarInscricoesParaOffline(eventoId)
      .then((lista) => salvarInscricoesOffline(lista))
      .catch(() => {})
  }, [eventoId])

  const syncFilaOffline = useCallback(async () => {
    const fila = await obterFilaPendente()
    if (fila.length === 0) return
    setSincronizando(true)
    let sincronizados = 0
    for (const item of fila) {
      try {
        if (item.subevento_id) {
          await realizarCheckinModoB(item.qr_token, item.subevento_id, item.dispositivo_id ?? undefined)
        } else {
          await realizarCheckin(item.qr_token, item.origem, item.dispositivo_id ?? undefined)
        }
        await marcarSincronizado(item.id)
        sincronizados++
      } catch {
        // mantém na fila para próximo ciclo
      }
    }
    setFilaOffline((n) => Math.max(0, n - sincronizados))
    setSincronizando(false)
  }, [])

  // Sync automático ao reconectar
  useEffect(() => {
    if (!online) return
    syncFilaOffline()
  }, [online, syncFilaOffline])

  // Mantém foco no input USB
  useEffect(() => {
    if (modo === 'usb') usbInputRef.current?.focus()
  }, [modo])

  // Limpa resultado após 4 segundos
  useEffect(() => {
    if (!resultado) return
    const t = setTimeout(() => setResultado(null), 4000)
    return () => clearTimeout(t)
  }, [resultado])

  const processarQrToken = useCallback(async (qrToken: string) => {
    if (!qrToken.trim()) return
    if (processingRef.current) return
    processingRef.current = true

    try {
      if (!online) {
        const local = await buscarInscricaoLocal(qrToken.trim())
        if (!local) {
          const res: CheckinResultado = { ok: false, tipo: 'invalido', mensagem: 'QR não encontrado (offline)' }
          setResultado(res)
          setHistorico((prev) => [{ ...res, ts: Date.now() }, ...prev.slice(0, 49)])
          beep('erro')
          return
        }
        // Modo B (checkin_livre): bloquear apenas se inscrição estiver cancelada;
        // entrada livre permite múltiplas visitas, ignora checkin_feito
        if (!isModoB && local.checkin_feito) {
          const res: CheckinResultado = {
            ok: false, tipo: 'ja_feito', mensagem: 'Já registrado (offline)',
            participante: { nome: local.participante_nome, email: local.participante_email },
          }
          setResultado(res)
          setHistorico((prev) => [{ ...res, ts: Date.now() }, ...prev.slice(0, 49)])
          beep('aviso')
          return
        }
        await enfileirarCheckin({
          qr_token: qrToken.trim(),
          origem: modo === 'camera' ? 'camera' : modo === 'usb' ? 'usb' : 'manual',
          dispositivo_id: dispositivoId,
          subevento_id: isModoB && subeventoId ? subeventoId : null,
          timestamp: Date.now(),
        })
        if (!isModoB) await marcarCheckinLocal(qrToken.trim())
        const res: CheckinResultado = {
          ok: true,
          tipo: 'sucesso',
          mensagem: isModoB ? 'Visita salva offline — será sincronizada' : 'Salvo offline — será sincronizado',
          participante: { nome: local.participante_nome, email: local.participante_email },
        }
        setResultado(res)
        setHistorico((prev) => [{ ...res, ts: Date.now() }, ...prev.slice(0, 49)])
        beep('sucesso')
        setTotalHoje((n) => n + 1)
        setFilaOffline((n) => n + 1)
        return
      }

      const res = isModoB && subeventoId
        ? await realizarCheckinModoB(qrToken.trim(), subeventoId, dispositivoId)
        : await realizarCheckin(
            qrToken.trim(),
            modo === 'camera' ? 'camera' : modo === 'usb' ? 'usb' : 'manual',
            dispositivoId
          )
      setResultado(res)
      setHistorico((prev) => [{ ...res, ts: Date.now() }, ...prev.slice(0, 49)])
      if (res.ok) {
        beep('sucesso')
        setTotalHoje((n) => n + 1)
      } else if (res.tipo === 'ja_feito') {
        beep('aviso')
      } else {
        beep('erro')
      }
    } finally {
      processingRef.current = false
    }
  }, [online, modo, dispositivoId, beep, isModoB, subeventoId])

  function handleUsbKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    clearTimeout(usbTimerRef.current)
    if (e.key === 'Enter') {
      const val = usbBufferRef.current || e.currentTarget.value
      usbBufferRef.current = ''
      ;(e.currentTarget as HTMLInputElement).value = ''
      processarQrToken(val)
      return
    }
    usbTimerRef.current = setTimeout(() => { usbBufferRef.current = '' }, 100)
  }

  function handleUsbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (val.length >= 36) {
      e.target.value = ''
      processarQrToken(val)
    }
  }

  async function handleBusca(termo: string) {
    setBuscaTermo(termo)
    if (termo.length < 2) { setBuscaResultados([]); return }
    const res = await buscarPorNomeOuEmail(eventoId, termo)
    setBuscaResultados(res)
  }

  const RESULTADO_CONFIG = {
    sucesso:   { bg: 'bg-status-success', icon: <CheckCircle2 size={32} />, titulo: 'Check-in OK!' },
    ja_feito:  { bg: 'bg-status-warning',  icon: <AlertCircle size={32} />,  titulo: 'Já registrado' },
    invalido:  { bg: 'bg-status-error',    icon: <XCircle size={32} />,      titulo: 'QR inválido' },
    cancelado: { bg: 'bg-status-error',    icon: <XCircle size={32} />,      titulo: 'Cancelado' },
    erro:      { bg: 'bg-status-error',    icon: <XCircle size={32} />,      titulo: 'Erro' },
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div>
          <p className="text-brand-lime font-bold text-lg font-display">
            Blū<span className="text-white">mi</span>
          </p>
          <p className="text-gray-400 text-xs">{eventoNome}{subeventoNome ? ` · ${subeventoNome}` : ''}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-display font-extrabold text-brand-lime text-3xl">{totalHoje}</p>
            <p className="text-gray-500 text-xs">check-ins</p>
          </div>
          {filaOffline > 0 && (
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full text-orange-400 bg-orange-950">
              <CloudOff size={12} />
              {filaOffline} na fila
            </div>
          )}
          {sincronizando && (
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full text-blue-400 bg-blue-950">
              <RefreshCw size={12} className="animate-spin" />
              Sincronizando
            </div>
          )}
          <div className={cn(
            'flex items-center gap-1.5 text-xs px-2 py-1 rounded-full',
            online ? 'text-status-success bg-green-950' : 'text-orange-400 bg-orange-950'
          )}>
            {online ? <Wifi size={12} /> : <WifiOff size={12} />}
            {online ? 'Online' : 'Offline'}
          </div>
          <p className="text-gray-500 text-xs hidden sm:block">{dispositivoNome}</p>
        </div>
      </header>

      {/* Banner offline */}
      {!online && (
        <div className="bg-orange-900/80 border-b border-orange-700 px-6 py-2 flex items-center gap-2 text-orange-200 text-sm">
          <CloudOff size={14} />
          Modo offline — check-ins estão sendo salvos localmente e serão sincronizados quando a conexão retornar.
        </div>
      )}

      {/* Feedback de resultado */}
      {resultado && (() => {
        const cfg = RESULTADO_CONFIG[resultado.tipo]
        return (
          <div className={cn('flex items-center gap-4 px-6 py-4 text-white transition-all', cfg.bg)}>
            {cfg.icon}
            <div>
              <p className="font-bold text-lg">{cfg.titulo}</p>
              {resultado.participante && (
                <p className="font-medium">{resultado.participante.nome}</p>
              )}
              <p className="text-sm opacity-80">{resultado.mensagem}</p>
            </div>
          </div>
        )
      })()}

      {/* Seletor de modo */}
      <div className="flex gap-1 px-6 pt-4">
        {[
          { id: 'usb' as const, label: 'USB / Teclado', icon: <Usb size={14} /> },
          { id: 'camera' as const, label: 'Câmera', icon: <Camera size={14} /> },
          { id: 'manual' as const, label: 'Busca manual', icon: <Search size={14} /> },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setModo(m.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium transition-colors',
              modo === m.id ? 'bg-brand-lime text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'
            )}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      <div className="flex-1 px-6 py-4">
        {/* Modo USB */}
        {modo === 'usb' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-card p-8 text-center border-2 border-dashed border-gray-700">
              <Usb size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Aponte o leitor USB para o QR Code</p>
              <p className="text-gray-600 text-xs mt-1">O check-in é feito automaticamente</p>
              <input
                ref={usbInputRef}
                onChange={handleUsbChange}
                onKeyDown={handleUsbKeyDown}
                className="opacity-0 absolute w-0 h-0"
                autoFocus
                tabIndex={0}
              />
            </div>
            <button
              onClick={() => usbInputRef.current?.focus()}
              className="w-full bg-gray-800 text-gray-400 py-2.5 rounded-btn text-sm hover:text-white transition-colors"
            >
              Clique aqui se o leitor não responder
            </button>
          </div>
        )}

        {/* Modo câmera */}
        {modo === 'camera' && (
          <ScannerCamera onScan={processarQrToken} ativo={modo === 'camera'} />
        )}

        {/* Modo manual */}
        {modo === 'manual' && (
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                autoFocus
                value={buscaTermo}
                onChange={(e) => handleBusca(e.target.value)}
                placeholder="Buscar por nome ou e-mail…"
                className="w-full bg-gray-900 border border-gray-700 text-white pl-9 pr-4 py-3 rounded-btn text-sm focus:outline-none focus:border-brand-lime placeholder:text-gray-600"
              />
            </div>
            <div className="space-y-2">
              {buscaResultados.map((p) => {
                const checkinFeito = (p.checkins ?? []).some((c: any) => !c.cancelado)
                return (
                  <div key={p.id} className="flex items-center justify-between bg-gray-900 rounded-btn px-4 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">{p.participantes?.nome}</p>
                      <p className="text-xs text-gray-500 truncate">{p.participantes?.email}</p>
                    </div>
                    {checkinFeito ? (
                      <span className="text-xs text-status-success font-semibold shrink-0 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Feito
                      </span>
                    ) : (
                      <button
                        onClick={() => processarQrToken(p.qr_token)}
                        disabled={pending}
                        className="bg-brand-lime text-gray-900 font-semibold text-xs px-3 py-1.5 rounded-btn hover:opacity-90 disabled:opacity-50 shrink-0"
                      >
                        Check-in
                      </button>
                    )}
                  </div>
                )
              })}
              {buscaTermo.length >= 2 && buscaResultados.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-4">Nenhum participante encontrado</p>
              )}
            </div>
          </div>
        )}

        {/* Histórico */}
        {historico.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Últimos check-ins</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {historico.slice(0, 10).map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-900 rounded px-3 py-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      h.ok ? 'bg-status-success' : h.tipo === 'ja_feito' ? 'bg-yellow-500' : 'bg-status-error'
                    )} />
                    <p className="text-sm text-gray-300 truncate">{h.participante?.nome ?? h.mensagem}</p>
                  </div>
                  <p className="text-xs text-gray-600 shrink-0">
                    {new Date(h.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
