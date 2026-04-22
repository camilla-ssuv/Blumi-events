'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, Loader2 } from 'lucide-react'

type Props = {
  onScan: (token: string) => void
  ativo: boolean
}

export function ScannerCamera({ onScan, ativo }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [estado, setEstado] = useState<'inativo' | 'iniciando' | 'ativo' | 'erro'>('inativo')
  const [erroMsg, setErroMsg] = useState('')
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>()

  useEffect(() => {
    if (!ativo) return
    iniciarCamera()
    return () => pararCamera()
  }, [ativo])

  async function iniciarCamera() {
    setEstado('iniciando')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setEstado('ativo')
        escanear()
      }
    } catch (err) {
      setEstado('erro')
      setErroMsg('Permissão de câmera negada ou indisponível')
    }
  }

  function pararCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
  }

  function escanear() {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(escanear)
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0)

    // BarcodeDetector API (Chrome 88+)
    if ('BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
      detector.detect(canvas).then((barcodes: any[]) => {
        if (barcodes.length > 0) {
          onScan(barcodes[0].rawValue)
          // Pausa breve para não fazer duplo scan
          setTimeout(() => {
            animFrameRef.current = requestAnimationFrame(escanear)
          }, 2000)
        } else {
          animFrameRef.current = requestAnimationFrame(escanear)
        }
      }).catch(() => {
        animFrameRef.current = requestAnimationFrame(escanear)
      })
    } else {
      // Fallback: usa zxing se disponível, senão mostra mensagem
      animFrameRef.current = requestAnimationFrame(escanear)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative bg-black rounded-card overflow-hidden aspect-video max-h-80">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />

        {/* Overlay de mira */}
        {estado === 'ativo' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-brand-lime rounded-lg opacity-70">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-lime rounded-tl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-lime rounded-tr" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-lime rounded-bl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-lime rounded-br" />
            </div>
          </div>
        )}

        {estado === 'iniciando' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <Loader2 size={32} className="text-brand-lime animate-spin" />
          </div>
        )}

        {estado === 'erro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
            <CameraOff size={32} className="text-gray-500" />
            <p className="text-gray-400 text-sm text-center px-6">{erroMsg}</p>
            <button
              onClick={iniciarCamera}
              className="bg-brand-lime text-gray-900 font-semibold text-sm px-4 py-2 rounded-btn"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>

      {estado === 'ativo' && (
        <p className="text-center text-xs text-gray-600">Aponte para o QR Code do participante</p>
      )}

      {!('BarcodeDetector' in window) && estado === 'ativo' && (
        <p className="text-center text-xs text-yellow-600 bg-yellow-950 rounded-btn px-3 py-2">
          Seu navegador não suporta leitura automática. Use Chrome 88+ para melhor experiência.
        </p>
      )}
    </div>
  )
}
