'use client'

import { useEffect, useRef } from 'react'

type Props = {
  value: string
  size?: number
}

export function QrCode({ value, size = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let cancelled = false

    async function draw() {
      const QRCode = (await import('qrcode')).default
      if (cancelled || !canvasRef.current) return
      await QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: { dark: '#314C5D', light: '#FFFFFF' },
      })
    }

    draw()
    return () => { cancelled = true }
  }, [value, size])

  return <canvas ref={canvasRef} width={size} height={size} className="rounded" />
}
