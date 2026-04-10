'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/sessionStore'
import { InactivityReset } from '@/components/kiosk/InactivityReset'
import { AnimatedBackground } from '@/components/kiosk/AnimatedBackground'
import { Roleta } from '@/components/kiosk/Roleta'
import { useRoleta } from '@/hooks/useRoleta'
import type { Premio } from '@/types'

export default function RoletaPage() {
  const router = useRouter()
  const { sessaoId, setPremioSorteado, quizCompleto, acertos, totalPerguntas } = useSessionStore()
  const [premios, setPremios] = useState<Premio[]>([])
  const [loading, setLoading] = useState(true)

  const percentualAcerto = totalPerguntas > 0
    ? Math.round((acertos / totalPerguntas) * 100)
    : 0

  useEffect(() => {
    if (!sessaoId || !quizCompleto) { router.replace('/'); return }
    fetch(`/api/premios?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setPremios(data) })
      .finally(() => setLoading(false))
  }, [sessaoId, quizCompleto, router])

  const handleSorteio = useCallback(
    (premio: Premio) => {
      setPremioSorteado(premio)
      if (typeof window !== 'undefined') {
        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({ particleCount: 300, spread: 100, origin: { y: 0.5 }, colors: ['#00AE9D', '#003641', '#7DB61C', '#C9D200', '#49479D'] })
          setTimeout(() => {
            confetti({ particleCount: 150, angle: 60, spread: 70, origin: { x: 0 } })
            confetti({ particleCount: 150, angle: 120, spread: 70, origin: { x: 1 } })
          }, 400)
          setTimeout(() => confetti({ particleCount: 100, spread: 130, origin: { y: 0.3 } }), 800)
          setTimeout(() => confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } }), 1400)
        })
      }
    },
    [setPremioSorteado]
  )

  const { girando, anguloAtual, premioSorteado, girar } = useRoleta({ premios, onSorteio: handleSorteio })

  const handleGirar = useCallback(async () => {
    if (!sessaoId || premios.length === 0 || girando) return
    try {
      const res = await fetch('/api/premios/sortear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessao_id: sessaoId, acertos, total_perguntas: totalPerguntas }),
      })
      const data = await res.json()
      if (data.premio) { girar(data.premio); return }
    } catch { /* fallback local */ }
    girar()
  }, [sessaoId, premios, girando, acertos, totalPerguntas, girar])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 text-center space-y-4 animate-fade-in">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-2xl font-semibold">Preparando a roleta...</p>
        </div>
      </div>
    )
  }

  // ── Tela de vitória ──────────────────────────────────────────────────────────
  if (premioSorteado) {
    const medalha = percentualAcerto >= 80 ? '🥇' : percentualAcerto >= 50 ? '🥈' : '🥉'
    return (
      <div className="kiosk-scroll">
        <InactivityReset />
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #001020 0%, #001f28 35%, #003030 65%, #001020 100%)' }}>

          <AnimatedBackground />

          {/* Raios de luz por trás */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div key={deg}
                className="absolute top-1/2 left-1/2 w-1 origin-bottom opacity-5"
                style={{
                  height: '60vh',
                  transform: `translate(-50%, -100%) rotate(${deg}deg)`,
                  background: 'linear-gradient(to top, transparent, #00AE9D)',
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center px-8 py-10 text-center max-w-2xl mx-auto">

            {/* Troféu */}
            <div className="relative mb-4 animate-pop-in">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150 animate-pulse" />
              <div className="text-[120px] leading-none relative z-10 animate-bounce-slow filter drop-shadow-2xl">
                🏆
              </div>
              <div className="absolute -top-4 -right-4 text-5xl animate-spin-slow">{medalha}</div>
              <div className="absolute -bottom-2 -left-4 text-4xl animate-spin-slow" style={{ animationDirection: 'reverse' }}>⭐</div>
              <div className="absolute top-1/2 -right-8 text-3xl animate-star-twinkle">✨</div>
              <div className="absolute top-0 left-0 text-3xl animate-star-twinkle" style={{ animationDelay: '0.7s' }}>✨</div>
            </div>

            {/* Título */}
            <h1 className="text-7xl font-black text-white font-display mb-2 animate-fade-in animate-shimmer"
              style={{ animationDelay: '0.3s' }}>
              PARABÉNS!
            </h1>
            <p className="text-gray-300 text-xl mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              Você completou o quiz com sucesso!
            </p>

            {/* Resultado do quiz */}
            <div className="flex items-center gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-7 py-4 border border-white/20">
                <div className="text-4xl font-black text-primary">{acertos}</div>
                <div className="text-gray-400 text-sm">de {totalPerguntas} acertos</div>
              </div>
              <div className="text-gray-600 text-3xl font-thin">|</div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-7 py-4 border border-white/20">
                <div className="text-4xl font-black text-[#7DB61C]">{percentualAcerto}%</div>
                <div className="text-gray-400 text-sm">aproveitamento</div>
              </div>
            </div>

            {/* Prêmio */}
            <div
              className="w-full rounded-3xl p-6 border-2 mb-6 animate-scale-in shadow-2xl"
              style={{
                animationDelay: '0.7s',
                background: 'linear-gradient(135deg, rgba(0,174,157,0.25), rgba(125,182,28,0.15))',
                borderColor: 'rgba(0,174,157,0.6)',
                boxShadow: '0 0 40px rgba(0,174,157,0.2)',
              }}
            >
              <p className="text-gray-300 text-lg mb-1">Você ganhou:</p>
              <p className="text-5xl font-black text-white font-display mb-2 animate-shimmer">
                {premioSorteado.nome}
              </p>
              {premioSorteado.descricao && (
                <p className="text-gray-300 text-lg">{premioSorteado.descricao}</p>
              )}
            </div>

            <button
              onClick={() => router.push('/')}
              className="px-12 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all active:scale-95"
            >
              Jogar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Tela da roleta ───────────────────────────────────────────────────────────
  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #001f28 0%, #003641 40%, #004d5c 70%, #001f28 100%)' }}>

        <AnimatedBackground />

        <div className="relative z-10 text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-3 mb-4">
            <span className="text-3xl animate-spin-slow">🎡</span>
            <h1 className="text-3xl font-black text-white font-display">Hora da Sorte!</h1>
          </div>
          <p className="text-gray-300 text-xl">Toque no botão e gire a roleta!</p>

          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-2.5">
              <span className="text-primary font-black text-xl">{acertos}</span>
              <span className="text-gray-400 text-sm ml-1">/ {totalPerguntas} acertos</span>
            </div>
          </div>
        </div>

        {premios.length === 0 ? (
          <div className="relative z-10 text-center animate-fade-in">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-white text-xl">Nenhum prêmio disponível no momento.</p>
          </div>
        ) : (
          <div className="relative z-10">
            <Roleta
              premios={premios}
              premioSorteado={premioSorteado}
              onGirar={handleGirar}
              girando={girando}
              anguloAtual={anguloAtual}
            />
          </div>
        )}
      </div>
    </div>
  )
}
