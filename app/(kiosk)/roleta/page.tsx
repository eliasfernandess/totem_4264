'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import { Roleta } from '@/components/kiosk/Roleta'
import { Button } from '@/components/ui/Button'
import { useRoleta } from '@/hooks/useRoleta'
import type { Premio } from '@/types'

export default function RoletaPage() {
  const router = useRouter()
  const { leadId, setPremioSorteado, quizCompleto } = useSessionStore()
  const [premios, setPremios] = useState<Premio[]>([])
  const [loading, setLoading] = useState(true)
  const [confeteAtivo, setConfeteAtivo] = useState(false)

  useEffect(() => {
    if (!leadId || !quizCompleto) {
      router.replace('/')
      return
    }

    fetch('/api/premios')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setPremios(data)
      })
      .finally(() => setLoading(false))
  }, [leadId, quizCompleto, router])

  const handleSorteio = useCallback(
    async (premio: Premio) => {
      if (!leadId) return

      try {
        const res = await fetch('/api/premios/sortear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id: leadId, premio_id: premio.id }),
        })
        const data = await res.json()
        if (data.error) return
      } catch {
        // Continua com o prêmio local mesmo em erro
      }

      setPremioSorteado(premio)
      setConfeteAtivo(true)

      // Confete via canvas-confetti
      if (typeof window !== 'undefined') {
        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({
            particleCount: 200,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00AE9D', '#003641', '#7DB61C', '#C9D200', '#49479D'],
          })
          setTimeout(() => {
            confetti({
              particleCount: 100,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
            })
            confetti({
              particleCount: 100,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
            })
          }, 300)
        })
      }
    },
    [leadId, setPremioSorteado]
  )

  const { girando, anguloAtual, premioSorteado, girar } = useRoleta({
    premios,
    onSorteio: handleSorteio,
  })

  const handleGirar = useCallback(async () => {
    if (!leadId || premios.length === 0) return

    try {
      const res = await fetch('/api/premios/sortear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId }),
      })
      const data = await res.json()
      if (data.premio) {
        girar(data.premio)
        return
      }
    } catch {
      // fallback para sorteio local
    }
    girar()
  }, [leadId, premios, girar])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-secondary via-secondary to-[#001f28] relative">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-black text-white font-display">
            {premioSorteado ? '🎉 Parabéns!' : '🎡 Hora da Sorte!'}
          </h1>
          {!premioSorteado && (
            <p className="text-gray-300 text-xl mt-2">Toque no botão e gire a roleta!</p>
          )}
        </div>

        {premios.length === 0 ? (
          <div className="text-center space-y-4">
            <p className="text-white text-xl">Nenhum prêmio disponível no momento.</p>
          </div>
        ) : (
          <Roleta
            premios={premios}
            premioSorteado={premioSorteado}
            onGirar={handleGirar}
            girando={girando}
            anguloAtual={anguloAtual}
          />
        )}

        {premioSorteado && (
          <div className="mt-10 animate-slide-up text-center space-y-4">
            <p className="text-gray-300 text-lg">Dirija-se ao balcão para retirar seu prêmio!</p>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-secondary"
            >
              Finalizar e jogar novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
