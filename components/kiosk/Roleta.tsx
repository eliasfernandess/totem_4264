'use client'

import { useEffect, useRef } from 'react'
import type { Premio } from '@/types'
import { Button } from '@/components/ui/Button'

interface RoletaProps {
  premios: Premio[]
  premioSorteado: Premio | null
  onGirar: () => void
  girando: boolean
  anguloAtual: number
}

const CORES = [
  '#00AE9D', '#7DB61C', '#49479D', '#C9D200',
  '#008C7E', '#5D9B1C', '#3D3B8E', '#A0AE00',
]

export function Roleta({ premios, premioSorteado, onGirar, girando, anguloAtual }: RoletaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const SIZE = 460

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || premios.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cx = SIZE / 2
    const cy = SIZE / 2
    const raio = SIZE / 2 - 4
    const fatia = (2 * Math.PI) / premios.length

    ctx.clearRect(0, 0, SIZE, SIZE)

    premios.forEach((premio, i) => {
      const inicio = fatia * i - Math.PI / 2
      const fim = inicio + fatia
      const meio = inicio + fatia / 2

      // Fatia
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, raio, inicio, fim)
      ctx.closePath()
      ctx.fillStyle = CORES[i % CORES.length]
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Texto sempre legível
      const maxLen = premios.length > 5 ? 11 : 14
      const texto = premio.nome.length > maxLen
        ? premio.nome.slice(0, maxLen) + '…'
        : premio.nome

      const fontSize = premios.length > 6 ? 12 : 14
      ctx.font = `bold ${fontSize}px Inter, sans-serif`
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 4

      ctx.save()
      ctx.translate(cx, cy)

      const flipped = Math.cos(meio) < 0

      if (flipped) {
        // Fatia na metade esquerda — girar 180° para texto ficar legível
        ctx.rotate(meio + Math.PI)
        ctx.textAlign = 'center'
        ctx.fillText(texto, -(raio * 0.58), 5)
      } else {
        // Fatia na metade direita — texto normal
        ctx.rotate(meio)
        ctx.textAlign = 'center'
        ctx.fillText(texto, raio * 0.58, 5)
      }

      ctx.restore()
    })

    // Círculo central
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.arc(cx, cy, 26, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.strokeStyle = '#003641'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, 8, 0, 2 * Math.PI)
    ctx.fillStyle = '#00AE9D'
    ctx.fill()
  }, [premios])

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        {/* Seta */}
        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 z-10 drop-shadow-lg">
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
            <polygon points="14,36 0,0 28,0" fill="#003641" />
            <polygon points="14,30 4,4 24,4" fill="#00AE9D" />
          </svg>
        </div>

        {/* Anel externo */}
        <div
          className="rounded-full p-2 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #003641, #00AE9D)' }}
        >
          <div
            className="rounded-full overflow-hidden"
            style={{
              transform: `rotate(${anguloAtual}deg)`,
              transition: girando
                ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                : 'none',
              width: SIZE,
              height: SIZE,
            }}
          >
            <canvas ref={canvasRef} width={SIZE} height={SIZE} />
          </div>
        </div>
      </div>

      {!premioSorteado && (
        <Button
          onClick={onGirar}
          disabled={girando || premios.length === 0}
          loading={girando}
          size="xl"
          className="px-16 shadow-2xl shadow-primary/40 text-xl"
        >
          {girando ? 'Girando...' : '🎯 Girar a Roleta!'}
        </Button>
      )}

      {premioSorteado && (
        <div className="text-center animate-slide-up space-y-2">
          <p className="text-xl text-gray-300">Você ganhou:</p>
          <p className="text-5xl font-black text-primary font-display">
            {premioSorteado.nome}
          </p>
          {premioSorteado.descricao && (
            <p className="text-gray-400 text-lg">{premioSorteado.descricao}</p>
          )}
        </div>
      )}
    </div>
  )
}
