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
  const { sessaoId, setPremioSorteado, quizCompleto, acertos, totalPerguntas, resetSession } = useSessionStore()
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
    } catch { /* fallback */ }
    girar()
  }, [sessaoId, premios, girando, acertos, totalPerguntas, girar])

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-3xl font-semibold">Preparando a roleta...</p>
        </div>
      </div>
    )
  }

  // ── Tela de vitória ──────────────────────────────────────────────
  if (premioSorteado) {
    const medalha = percentualAcerto >= 80 ? '🥇' : percentualAcerto >= 50 ? '🥈' : '🥉'
    return (
      <div className="kiosk-scroll">
        <InactivityReset />
        <div className="min-h-screen flex flex-col items-center justify-between px-8 py-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #001020 0%, #001f28 35%, #003030 65%, #001020 100%)' }}>

          <AnimatedBackground />

          {/* Raios de luz */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div key={deg}
                className="absolute top-1/2 left-1/2 w-0.5 origin-bottom opacity-[0.06]"
                style={{
                  height: '65vh',
                  transform: `translate(-50%, -100%) rotate(${deg}deg)`,
                  background: 'linear-gradient(to top, transparent, #00AE9D)',
                }}
              />
            ))}
          </div>

          {/* Troféu */}
          <div className="relative z-10 animate-pop-in flex-shrink-0 pt-4">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-[2] animate-pulse" />
            <div className="text-[130px] leading-none relative z-10 animate-bounce-slow filter drop-shadow-2xl">🏆</div>
            <div className="absolute -top-4 -right-4 text-5xl animate-spin-slow">{medalha}</div>
            <div className="absolute -bottom-2 -left-5 text-4xl animate-spin-slow" style={{ animationDirection: 'reverse' }}>⭐</div>
            <div className="absolute top-1/2 -right-8 text-3xl animate-star-twinkle">✨</div>
          </div>

          {/* Título + pontuação */}
          <div className="relative z-10 text-center space-y-4" style={{ animation: 'slideUp 0.5s 0.3s ease-out both' }}>
            <h1 className="text-8xl font-black text-white font-display animate-shimmer">
              PARABÉNS!
            </h1>
            <p className="text-2xl text-gray-300">Você completou o quiz com sucesso!</p>

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-5 border border-white/20 text-center">
                <div className="text-5xl font-black text-primary">{acertos}</div>
                <div className="text-gray-400 text-base mt-1">de {totalPerguntas} acertos</div>
              </div>
              <div className="text-gray-600 text-4xl">|</div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-5 border border-white/20 text-center">
                <div className="text-5xl font-black text-[#7DB61C]">{percentualAcerto}%</div>
                <div className="text-gray-400 text-base mt-1">aproveitamento</div>
              </div>
            </div>
          </div>

          {/* Prêmio */}
          <div className="relative z-10 w-full max-w-xl animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <div className="rounded-3xl p-8 border-2 shadow-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(0,174,157,0.25), rgba(125,182,28,0.15))',
                borderColor: 'rgba(0,174,157,0.6)',
                boxShadow: '0 0 50px rgba(0,174,157,0.25)',
              }}>
              <p className="text-gray-300 text-xl mb-2">Você ganhou:</p>
              <p className="text-6xl font-black text-white font-display animate-shimmer leading-tight">
                {premioSorteado.nome}
              </p>
              {premioSorteado.descricao && (
                <p className="text-gray-300 text-lg mt-3">{premioSorteado.descricao}</p>
              )}
            </div>
          </div>

          {/* Botão */}
          <div className="relative z-10 w-full max-w-xl">
            <button
              onClick={() => { resetSession() }}
              className="w-full py-6 rounded-2xl border-2 border-white/30 text-white font-bold text-2xl hover:bg-white/10 transition-all active:scale-95"
            >
              Jogar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Tela da roleta ───────────────────────────────────────────────
  return (
    <div className="kiosk-scroll">
      <InactivityReset />
      <div className="min-h-screen flex flex-col items-center justify-between px-8 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #001f28 0%, #003641 40%, #004d5c 70%, #001f28 100%)' }}>

        <AnimatedBackground />

        {/* Header */}
        <div className="relative z-10 text-center animate-fade-in flex-shrink-0 w-full">
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-8 py-4 mb-4">
            <span className="text-4xl animate-spin-slow">🎡</span>
            <h1 className="text-4xl font-black text-white font-display">Hora da Sorte!</h1>
          </div>
          <p className="text-gray-300 text-xl">Toque no botão e gire a roleta!</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-3">
              <span className="text-primary font-black text-2xl">{acertos}</span>
              <span className="text-gray-400 text-base ml-1">/ {totalPerguntas} acertos</span>
            </div>
          </div>
        </div>

        {/* Roleta ou sem prêmios */}
        {premios.length === 0 ? (
          <div className="relative z-10 text-center animate-fade-in space-y-6 flex-1 flex flex-col items-center justify-center">
            <div className="text-8xl">😔</div>
            <p className="text-white text-2xl font-semibold">Nenhum prêmio disponível no momento.</p>
            <p className="text-gray-400 text-lg">Os prêmios serão repostos em breve!</p>
            <button
              onClick={() => { resetSession() }}
              className="px-16 py-5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-2xl shadow-lg shadow-primary/30 transition-all active:scale-95"
            >
              Jogar novamente
            </button>
          </div>
        ) : (
          <div className="relative z-10 flex-1 flex items-center justify-center w-full">
            <Roleta
              premios={premios}
              premioSorteado={premioSorteado}
              onGirar={handleGirar}
              girando={girando}
              anguloAtual={anguloAtual}
            />
          </div>
        )}

        {/* Spacer bottom */}
        <div className="flex-shrink-0 h-4" />
      </div>
    </div>
  )
}
